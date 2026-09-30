import Issue from "../models/Issue.js";
import { classifyIssue, calculatePriority } from "../services/classificationEngine.js";
import { httpError } from "../utils/httpError.js";

export async function listIssues(req, res, next) {
  try {
    const issues = await Issue.find().sort({ createdAt: -1 }).limit(100);
    res.json({ issues });
  } catch (error) {
    next(error);
  }
}

export async function getIssue(req, res, next) {
  try {
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      throw httpError("Issue not found.", 404);
    }

    res.json({ issue });
  } catch (error) {
    next(error);
  }
}

export async function createIssue(req, res, next) {
  try {
    const { title, description, latitude, longitude, imageUrl } = req.body;

    if (!title?.trim() || !description?.trim()) {
      throw httpError("Title and description are required.");
    }

    const classification = classifyIssue({ title, description });

    const priority = calculatePriority({
      title,
      description,
      latitude,
      longitude,
      category: classification.category
    });

    const issue = await Issue.create({
      title,
      description,
      location: {
        latitude: latitude ?? null,
        longitude: longitude ?? null
      },
      imageUrl: imageUrl ?? null,
      ...classification,
      ...priority
    });

    res.status(201).json({ issue });
  } catch (error) {
    next(error);
  }
}

export async function updateIssueStatus(req, res, next) {
  try {
    const allowedStatuses = ["submitted", "in_review", "assigned", "resolved"];

    if (!allowedStatuses.includes(req.body.status)) {
      throw httpError("Invalid issue status.");
    }

    const issue = await Issue.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true, runValidators: true }
    );

    if (!issue) {
      throw httpError("Issue not found.", 404);
    }

    res.json({ issue });
  } catch (error) {
    next(error);
  }
}
