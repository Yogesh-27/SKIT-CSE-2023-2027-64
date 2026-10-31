import mongoose from "mongoose";

/**
 * CivicSolve — Issue Model
 *
 * Stores a single civic complaint submitted by a citizen.
 * The classification engine automatically populates:
 *   category, department, confidence, matchedKeywords
 * The priority engine populates:
 *   priority, priorityScore, priorityReasons, slaHours, dueBy
 *
 * Author (DB design): Arun Kumar Yadav (Team Lead)
 * Classification fields: Yogesh Acharya (Member 1)
 */

const historyEntrySchema = new mongoose.Schema(
  {
    status: { type: String, required: true },
    note: { type: String, default: "" },
    at: { type: Date, default: Date.now }
  },
  { _id: false }
);

const issueSchema = new mongoose.Schema(
  {
    // ── Core report fields ────────────────────────────────────────────────
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 120
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 15,
      maxlength: 2000
    },

    // ── Auto-classification fields (set by classification engine) ─────────
    category: {
      type: String,
      enum: [
        "Roads & Potholes",
        "Water Supply",
        "Sanitation & Garbage",
        "Electricity & Street Lights",
        "Drainage & Sewage",
        "Public Safety",
        "Parks & Public Spaces",
        "General Complaint"
      ],
      default: "General Complaint"
    },
    department: {
      type: String,
      required: true,
      default: "Municipal Help Desk"
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1,
      default: 0
    },
    matchedKeywords: {
      type: [String],
      default: []
    },

    // ── Priority fields (set by priority engine) ──────────────────────────
    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "low"
    },
    priorityScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    priorityReasons: {
      type: [String],
      default: []
    },
    slaHours: {
      type: Number,
      default: 168 // 7 days
    },
    dueBy: {
      type: Date,
      default: null
    },

    // ── Workflow fields ───────────────────────────────────────────────────
    status: {
      type: String,
      enum: ["submitted", "in_review", "assigned", "in_progress", "resolved", "rejected"],
      default: "submitted"
    },
    history: {
      type: [historyEntrySchema],
      default: []
    },

    // ── Community engagement ──────────────────────────────────────────────
    upvotes: {
      type: Number,
      min: 0,
      default: 0
    },

    // ── Location (GPS) ────────────────────────────────────────────────────
    location: {
      latitude: { type: Number, default: null },
      longitude: { type: Number, default: null }
    },

    // ── Media ─────────────────────────────────────────────────────────────
    imageUrl: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true, // adds createdAt and updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
issueSchema.index({ status: 1, priorityScore: -1 });
issueSchema.index({ category: 1, status: 1 });
issueSchema.index({ "location.latitude": 1, "location.longitude": 1 });
issueSchema.index({ createdAt: -1 });

export default mongoose.model("Issue", issueSchema);
