import Issue from "../models/Issue.js";
import { classifyIssue, calculatePriority, haversineMeters } from "../services/classificationEngine.js";
import { httpError } from "../utils/httpError.js";

const OPEN_STATUSES = ["submitted", "in_review", "assigned", "in_progress"];
const WORKFLOW = {
  submitted: ["in_review", "assigned", "rejected"],
  in_review: ["assigned", "rejected"],
  assigned: ["in_progress", "rejected"],
  in_progress: ["resolved", "assigned"],
  resolved: [], rejected: []
};

export async function listIssues(req, res, next) {
  try {
    const filter = {};
    for (const key of ["status", "priority", "category", "department"]) {
      if (req.query[key]) filter[key] = req.query[key];
    }
    const issues = await Issue.find(filter).sort({ priorityScore: -1, createdAt: -1 }).limit(200);
    res.json({ issues });
  } catch (error) { next(error); }
}

export async function getIssue(req, res, next) {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) throw httpError("Issue not found.", 404);
    res.json({ issue });
  } catch (error) { next(error); }
}

export async function createIssue(req, res, next) {
  try {
    const body = req.body ?? {};
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const description = typeof body.description === "string" ? body.description.trim() : "";
    if (title.length < 5 || title.length > 100) throw httpError("Title must be 5–100 characters.", 400);
    if (description.length < 15 || description.length > 1000) throw httpError("Description must be 15–1,000 characters.", 400);

    const hasLat = body.latitude !== undefined && body.latitude !== null && body.latitude !== "";
    const hasLng = body.longitude !== undefined && body.longitude !== null && body.longitude !== "";
    if (hasLat !== hasLng) throw httpError("Provide both latitude and longitude, or leave both empty.", 400);
    let latitude = null, longitude = null;
    if (hasLat) {
      latitude = Number(body.latitude); longitude = Number(body.longitude);
      if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) throw httpError("Latitude must be between -90 and 90.", 400);
      if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) throw httpError("Longitude must be between -180 and 180.", 400);
    }
    const imageUrl = typeof body.imageUrl === "string" && body.imageUrl.trim() ? body.imageUrl.trim() : null;
    const classification = classifyIssue({ title, description });
    const location = { latitude, longitude };

    // Merge into an open same-category issue when both reports have GPS coordinates within 50 m.
    if (latitude !== null) {
      const candidates = await Issue.find({ category: classification.category, status: { $in: OPEN_STATUSES }, "location.latitude": { $ne: null }, "location.longitude": { $ne: null } }).sort({ createdAt: -1 }).limit(300);
      const duplicate = candidates.find(item => haversineMeters(location, item.location) <= 50);
      if (duplicate) {
        duplicate.upvotes += 1;
        const priority = calculatePriority({ title: duplicate.title, description: duplicate.description, category: duplicate.category, hasPhoto: Boolean(duplicate.imageUrl), upvotes: duplicate.upvotes });
        duplicate.priority = priority.priority;
        duplicate.priorityScore = priority.priorityScore;
        duplicate.priorityReasons = priority.priorityReasons;
        duplicate.slaHours = priority.slaHours;
        duplicate.dueBy = priority.dueBy;
        duplicate.history.push({ status: duplicate.status, note: `Nearby duplicate report merged (+1 upvote)`, at: new Date() });
        await duplicate.save();
        return res.status(200).json({ duplicate: true, message: "A matching open issue was found within 50 metres; your report was added to it.", issue: duplicate });
      }
    }

    const priority = calculatePriority({ title, description, category: classification.category, hasPhoto: Boolean(imageUrl), upvotes: 0 });
    const issue = await Issue.create({ title, description, location, imageUrl, ...classification, ...priority, status: "submitted", upvotes: 0, history: [{ status: "submitted", note: "Report received, validated, classified and routed automatically.", at: new Date() }] });
    res.status(201).json({ duplicate: false, issue });
  } catch (error) { next(error); }
}













export async function updateIssueStatus(req, res, next) {
  try {
    const nextStatus = req.body?.status;
    if (!Object.hasOwn(WORKFLOW, nextStatus)) throw httpError("Invalid issue status.", 400);
    const issue = await Issue.findById(req.params.id);
    if (!issue) throw httpError("Issue not found.", 404);
    if (!WORKFLOW[issue.status].includes(nextStatus)) throw httpError(`Cannot move from ${issue.status} to ${nextStatus}. Allowed: ${WORKFLOW[issue.status].join(", ") || "none (final state)"}.`, 400);
    issue.status = nextStatus;
    issue.history.push({ status: nextStatus, note: typeof req.body.note === "string" && req.body.note.trim() ? req.body.note.trim().slice(0, 500) : `Status changed to ${nextStatus}`, at: new Date() });
    await issue.save();
    res.json({ issue });
  } catch (error) { next(error); }
}
