import mongoose from "mongoose";

const issueSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000
    },
    category: {
      type: String,
      enum: [
        "roads",
        "sanitation",
        "water",
        "public_utilities",
        "drainage",
        "other"
      ],
      default: "other"
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "low"
    },
    priorityScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    department: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ["submitted", "in_review", "assigned", "resolved"],
      default: "submitted"
    },
    location: {
      latitude: Number,
      longitude: Number
    },
    imageUrl: {
      type: String,
      default: null
    }
  },
  { timestamps: true }
);

export default mongoose.model("Issue", issueSchema);
