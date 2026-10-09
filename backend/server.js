const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");

const db = require("./db");
const { validateReport, findDuplicate } = require("./services/preprocess");
const { classify } = require("./services/classifier");
const { calculatePriority } = require("./services/priority");
const { route, WORKFLOW } = require("./services/routing");

const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ---- photo upload (images only, max 5 MB) ----
const upload = multer({
  storage: multer.diskStorage({
    destination: path.join(__dirname, "uploads"),
    filename: (req, file, cb) =>
      cb(null, Date.now() + "-" + file.originalname.replace(/[^a-zA-Z0-9.]/g, "_"))
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) =>
    file.mimetype.startsWith("image/") ? cb(null, true) : cb(new Error("Only image files are allowed"))
});

// ---------- ROUTES ----------
app.get("/api/health", (req, res) => res.json({ status: "ok", database: db.getMode() }));

// 1. Citizen submits a report  (Preprocessing -> Classification -> Priority -> Routing)
app.post("/api/issues", (req, res) => {
  upload.single("photo")(req, res, async err => {
    try {
      if (err) return res.status(400).json({ errors: [err.message] });

      // STEP 1: validation
      const { valid, errors, clean } = validateReport(req.body);
      if (!valid) return res.status(400).json({ errors });

      // STEP 2: classification
      const cls = classify(clean.title, clean.description);

      // STEP 3: de-duplication
      const existing = await db.all();
      const dup = findDuplicate(existing, cls.category, clean.lat, clean.lng);
      if (dup) {
        const upvotes = (dup.upvotes || 0) + 1;
        const pr = calculatePriority({
          category: dup.category, title: dup.title, description: dup.description,
          hasPhoto: !!dup.photo, upvotes
        });
        const rt = route(dup.category, pr.level);
        const history = [...dup.history, {
          status: dup.status,
          note: `Duplicate report received from ${clean.reporterName} - priority re-evaluated`,
          at: new Date().toISOString()
        }];
        const updated = await db.update(dup.id, {
          upvotes, priority: pr, history,
          department: dup.department, slaHours: rt.slaHours, dueBy: dup.dueBy
        });
        return res.status(200).json({ duplicate: true, message: `Similar issue already reported nearby (${dup.id}). We added your report to it.`, issue: updated });
      }

      // STEP 4: priority scoring
      const priority = calculatePriority({
        category: cls.category, title: clean.title, description: clean.description,
        hasPhoto: !!req.file, upvotes: 0
      });

      // STEP 5: department routing + SLA
      const routing = route(cls.category, priority.level);

      const now = new Date().toISOString();
      const issue = {
        id: await db.nextId(),
        title: clean.title,
        description: clean.description,
        reporterName: clean.reporterName,
        location: { lat: clean.lat, lng: clean.lng, address: clean.address },
        photo: req.file ? "/uploads/" + req.file.filename : null,
        category: cls.category,
        classification: { confidence: cls.confidence, matchedKeywords: cls.matchedKeywords },
        priority,
        department: routing.department,
        slaHours: routing.slaHours,
        dueBy: routing.dueBy,
        status: "Submitted",
        upvotes: 0,
        history: [
          { status: "Submitted", note: "Report received & validated", at: now },
          { status: "Submitted", note: `Auto-classified as "${cls.category}" and routed to ${routing.department}`, at: now }
        ],
        createdAt: now
      };
      await db.create(issue);
      res.status(201).json({ duplicate: false, issue });
    } catch (e) {
      console.error(e);
      res.status(500).json({ errors: ["Server error: " + e.message] });
    }
  });
});

// 2. Authority dashboard - list with filters
app.get("/api/issues", async (req, res) => {
  const { status, priority, category } = req.query;
  let list = await db.all();
  if (status) list = list.filter(i => i.status === status);
  if (priority) list = list.filter(i => i.priority.level === priority);
  if (category) list = list.filter(i => i.category === category);
  list.sort((a, b) => b.priority.score - a.priority.score || new Date(b.createdAt) - new Date(a.createdAt));
  res.json(list);
});

// 3. Statistics for dashboard cards
app.get("/api/stats", async (req, res) => {
  const list = await db.all();
  const count = (key, fn) => list.reduce((m, i) => { const k = fn(i); m[k] = (m[k] || 0) + 1; return m; }, {});
  res.json({
    total: list.length,
    byStatus: count("s", i => i.status),
    byPriority: count("p", i => i.priority.level),
    byCategory: count("c", i => i.category)
  });
});

// 4. Citizen tracks a complaint by ticket ID
app.get("/api/issues/:id", async (req, res) => {
  const issue = await db.get(req.params.id.toUpperCase());
  if (!issue) return res.status(404).json({ errors: ["No complaint found with this ID"] });
  res.json(issue);
});

// 5. Authority updates status (workflow engine enforces allowed transitions)
app.patch("/api/issues/:id/status", async (req, res) => {
  const issue = await db.get(req.params.id);
  if (!issue) return res.status(404).json({ errors: ["Issue not found"] });
  const { status, note } = req.body;
  if (!WORKFLOW[issue.status].includes(status)) {
    return res.status(400).json({
      errors: [`Cannot move from "${issue.status}" to "${status}". Allowed: ${WORKFLOW[issue.status].join(", ") || "none (final state)"}`]
    });
  }
  const history = [...issue.history, { status, note: note || `Status changed to ${status}`, at: new Date().toISOString() }];
  res.json(await db.update(issue.id, { status, history }));
});

const PORT = process.env.PORT || 5000;
db.connect().then(() =>
  app.listen(PORT, () => console.log(`🚀 CivicSolve backend running at http://localhost:${PORT}`))
);
