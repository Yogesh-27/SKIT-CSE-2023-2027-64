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
    const { title, description, latitude, longitude, imageUrl } = req.body ?? {};
    const cleanTitle = typeof title === "string" ? title.trim() : "";
    const cleanDescription = typeof description === "string" ? description.trim() : "";

    if (!cleanTitle || !cleanDescription) {
      throw httpError("Title and description are required.", 400);
    }
    if (cleanTitle.length > 120) {
      throw httpError("Title must be 120 characters or fewer.", 400);
    }
    if (cleanDescription.length > 2000) {
      throw httpError("Description must be 2,000 characters or fewer.", 400);
    }

    const hasLatitude = latitude !== null && latitude !== undefined && latitude !== "";
    const hasLongitude = longitude !== null && longitude !== undefined && longitude !== "";
    if (hasLatitude !== hasLongitude) {
      throw httpError("Provide both latitude and longitude, or leave both empty.", 400);
    }

    let parsedLatitude = null;
    let parsedLongitude = null;
    if (hasLatitude && hasLongitude) {
      parsedLatitude = Number(latitude);
      parsedLongitude = Number(longitude);
      if (!Number.isFinite(parsedLatitude) || parsedLatitude < -90 || parsedLatitude > 90) {
        throw httpError("Latitude must be a number between -90 and 90.", 400);
      }
      if (!Number.isFinite(parsedLongitude) || parsedLongitude < -180 || parsedLongitude > 180) {
        throw httpError("Longitude must be a number between -180 and 180.", 400);
      }
    }

    const classification = classifyIssue({
      title: cleanTitle,
      description: cleanDescription
    });

    const priority = calculatePriority({
      title: cleanTitle,
      description: cleanDescription,
      latitude: parsedLatitude,
      longitude: parsedLongitude,
      category: classification.category
    });

    const issue = await Issue.create({
      title: cleanTitle,
      description: cleanDescription,
      location: {
        latitude: parsedLatitude,
        longitude: parsedLongitude
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

    if (!allowedStatuses.includes(req.body?.status)) {
      throw httpError("Invalid issue status.", 400);
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
