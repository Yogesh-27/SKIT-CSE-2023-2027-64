import Issue from "../models/Issue.js";
import { classifyIssue, calculatePriority, haversineMeters } from "../services/classificationEngine.js";
import { httpError } from "../utils/httpError.js";

/**
 * CivicSolve — Issue Controller
 *
 * Handles all issue-related HTTP requests including:
 * - Listing, fetching, creating issues
 * - Status workflow transitions
 * - Community upvoting
 *
 * Author: Yogendra Jain (Member 2) — Backend & Workflow Engine
 * Classification integration: Yogesh Acharya (Member 1)
 * DB schema: Arun Kumar Yadav (Team Lead)
 */

// Statuses that are still "open" for duplicate detection
const OPEN_STATUSES = ["submitted", "in_review", "assigned", "in_progress"];

// Valid status transitions (workflow engine)
const WORKFLOW = {
  submitted:   ["in_review", "assigned", "rejected"],
  in_review:   ["assigned", "rejected"],
  assigned:    ["in_progress", "rejected"],
  in_progress: ["resolved", "assigned"],
  resolved:    [],
  rejected:    []
};

// ── List issues ───────────────────────────────────────────────────────────────
export async function listIssues(req, res, next) {
  try {
    const filter = {};
    for (const key of ["status", "priority", "category", "department"]) {
      if (req.query[key]) filter[key] = req.query[key];
    }
    const limit = Math.min(parseInt(req.query.limit, 10) || 200, 500);
    const issues = await Issue.find(filter)
      .sort({ priorityScore: -1, createdAt: -1 })
      .limit(limit)
      .lean();
    res.json({ issues, total: issues.length });
  } catch (error) {
    next(error);
  }
}

// ── Get a single issue ────────────────────────────────────────────────────────
export async function getIssue(req, res, next) {
  try {
    const issue = await Issue.findById(req.params.id).lean();
    if (!issue) throw httpError("Issue not found.", 404);
    res.json({ issue });
  } catch (error) {
    next(error);
  }
}

// ── Create a new issue ────────────────────────────────────────────────────────
export async function createIssue(req, res, next) {
  try {
    const body = req.body ?? {};

    // ── Validate title
    const title = typeof body.title === "string" ? body.title.trim() : "";
    if (title.length < 5 || title.length > 120) {
      throw httpError("Title must be between 5 and 120 characters.", 400);
    }

    // ── Validate description
    const description = typeof body.description === "string" ? body.description.trim() : "";
    if (description.length < 15 || description.length > 2000) {
      throw httpError("Description must be between 15 and 2,000 characters.", 400);
    }

    // ── Validate GPS (optional, but if one is given both are required)
    const hasLat = body.latitude !== undefined && body.latitude !== null && body.latitude !== "";
    const hasLng = body.longitude !== undefined && body.longitude !== null && body.longitude !== "";
    if (hasLat !== hasLng) {
      throw httpError("Provide both latitude and longitude, or leave both empty.", 400);
    }
    let latitude = null;
    let longitude = null;
    if (hasLat) {
      latitude  = Number(body.latitude);
      longitude = Number(body.longitude);
      if (!Number.isFinite(latitude)  || latitude  < -90  || latitude  > 90) throw httpError("Latitude must be between -90 and 90.", 400);
      if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) throw httpError("Longitude must be between -180 and 180.", 400);
    }

    const imageUrl = typeof body.imageUrl === "string" && body.imageUrl.trim()
      ? body.imageUrl.trim()
      : null;

    // ── Auto-classify the issue
    const classification = classifyIssue({ title, description });
    const location = { latitude, longitude };

    // ── Duplicate detection: merge into an open same-category report within 50 m
    if (latitude !== null) {
      const candidates = await Issue.find({
        category: classification.category,
        status: { $in: OPEN_STATUSES },
        "location.latitude":  { $ne: null },
        "location.longitude": { $ne: null }
      })
        .sort({ createdAt: -1 })
        .limit(300)
        .lean();

      const duplicate = candidates.find(
        (item) => haversineMeters(location, item.location) <= 50
      );

      if (duplicate) {
        const updated = await Issue.findById(duplicate._id);
        updated.upvotes += 1;
        const newPriority = calculatePriority({
          title:       updated.title,
          description: updated.description,
          category:    updated.category,
          hasPhoto:    Boolean(updated.imageUrl),
          upvotes:     updated.upvotes
        });
        Object.assign(updated, newPriority);
        updated.history.push({
          status: updated.status,
          note:   "Nearby duplicate report merged — upvote added.",
          at:     new Date()
        });
        await updated.save();
        return res.status(200).json({
          duplicate: true,
          message:
            "A matching open issue was found within 50 metres. Your report has been added as an upvote.",
          issue: updated
        });
      }
    }

    // ── Calculate priority
    const priorityResult = calculatePriority({
      title,
      description,
      category: classification.category,
      hasPhoto: Boolean(imageUrl),
      upvotes:  0
    });

    // ── Save new issue
    const issue = await Issue.create({
      title,
      description,
      location,
      imageUrl,
      ...classification,
      ...priorityResult,
      status:  "submitted",
      upvotes: 0,
      history: [
        {
          status: "submitted",
          note:   "Report received, validated, classified and routed automatically.",
          at:     new Date()
        }
      ]
    });

    res.status(201).json({ duplicate: false, issue });
  } catch (error) {
    next(error);
  }
}

// ── Update issue status (workflow engine) ─────────────────────────────────────
export async function updateIssueStatus(req, res, next) {
  try {
    const nextStatus = req.body?.status;
    if (!Object.hasOwn(WORKFLOW, nextStatus ?? "")) {
      throw httpError(`Invalid status value: "${nextStatus}".`, 400);
    }

    const issue = await Issue.findById(req.params.id);
    if (!issue) throw httpError("Issue not found.", 404);

    const allowed = WORKFLOW[issue.status];
    if (!allowed.includes(nextStatus)) {
      throw httpError(
        `Cannot transition from "${issue.status}" to "${nextStatus}". Allowed transitions: ${allowed.length ? allowed.join(", ") : "none (terminal state)"}.`,
        400
      );
    }

    issue.status = nextStatus;
    const noteText =
      typeof req.body?.note === "string" && req.body.note.trim()
        ? req.body.note.trim().slice(0, 500)
        : `Status updated to ${nextStatus}.`;
    issue.history.push({ status: nextStatus, note: noteText, at: new Date() });
    await issue.save();

    res.json({ issue });
  } catch (error) {
    next(error);
  }
}

// ── Upvote an issue ───────────────────────────────────────────────────────────
export async function upvoteIssue(req, res, next) {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) throw httpError("Issue not found.", 404);

    if (["resolved", "rejected"].includes(issue.status)) {
      throw httpError("Cannot upvote a resolved or rejected issue.", 400);
    }

    issue.upvotes += 1;

    // Recalculate priority to reflect community upvote
    const newPriority = calculatePriority({
      title:       issue.title,
      description: issue.description,
      category:    issue.category,
      hasPhoto:    Boolean(issue.imageUrl),
      upvotes:     issue.upvotes
    });
    Object.assign(issue, newPriority);

    issue.history.push({
      status: issue.status,
      note:   `Community upvote added (total: ${issue.upvotes}).`,
      at:     new Date()
    });

    await issue.save();
    res.json({ issue });
  } catch (error) {
    next(error);
  }
}
