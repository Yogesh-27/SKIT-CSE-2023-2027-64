// Adds sample complaints so the dashboard is not empty during the demo.
// Run:  npm run seed
const db = require("./db");
const { classify } = require("./services/classifier");
const { calculatePriority } = require("./services/priority");
const { route } = require("./services/routing");

const samples = [
  ["Big pothole near Jawahar Circle", "Huge pothole on main road, two bikers fell down yesterday. Very dangerous at night.", 26.8467, 75.8040, "Jawahar Circle, Jaipur", "Ravi"],
  ["Garbage not collected", "Kachra not picked up for 5 days near market, heavy smell and dirty surroundings.", 26.9124, 75.7873, "MI Road, Jaipur", "Neha"],
  ["Street light not working", "Street light pole near school gate is off since 2 weeks, area is dark and unsafe for children.", 26.8851, 75.7466, "Vaishali Nagar, Jaipur", "Amit"],
  ["Water pipeline leakage", "Main pipe leak, lots of clean water wasted on the road since morning.", 26.9239, 75.8267, "Chandpole, Jaipur", "Sunita"],
  ["Open manhole on road", "Open manhole without cover near hospital entrance, risk of accident. Urgent!", 26.8998, 75.8120, "SMS Hospital Road, Jaipur", "Karan"],
  ["Drain overflow", "Blocked drain overflowing on the street, waterlogging after rain.", 26.8600, 75.7900, "Malviya Nagar, Jaipur", "Pooja"],
  ["Broken bench in park", "Benches in the garden are broken and the playground needs repair.", 26.9500, 75.7700, "Central Park, Jaipur", "Mohit"]
];

(async () => {
  await db.connect();
  await db.clear();
  for (const [title, description, lat, lng, address, reporterName] of samples) {
    const cls = classify(title, description);
    const priority = calculatePriority({ category: cls.category, title, description, hasPhoto: false, upvotes: 0 });
    const rt = route(cls.category, priority.level);
    const now = new Date().toISOString();
    await db.create({
      id: await db.nextId(), title, description, reporterName,
      location: { lat, lng, address }, photo: null,
      category: cls.category,
      classification: { confidence: cls.confidence, matchedKeywords: cls.matchedKeywords },
      priority, department: rt.department, slaHours: rt.slaHours, dueBy: rt.dueBy,
      status: "Submitted", upvotes: 0,
      history: [
        { status: "Submitted", note: "Report received & validated", at: now },
        { status: "Submitted", note: `Auto-classified as "${cls.category}" and routed to ${rt.department}`, at: now }
      ],
      createdAt: now
    });
  }
  console.log("🌱 Seeded", samples.length, "sample complaints");
  process.exit(0);
})();
