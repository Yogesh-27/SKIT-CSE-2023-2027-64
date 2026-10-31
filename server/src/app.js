import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDatabase } from "./config/db.js";
import issueRoutes from "./routes/issueRoutes.js";
import departmentRoutes from "./routes/departmentRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";

/**
 * CivicSolve — Express Application
 *
 * Author: Yogendra Jain (Member 2) — Backend & Workflow Engine
 */

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173"
  })
);
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "civicsolve-api",
    version: "0.2.0",
    timestamp: new Date().toISOString()
  });
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/issues",      issueRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/analytics",   analyticsRoutes);

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: "Route not found." });
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use(errorHandler);

// ── Start server ──────────────────────────────────────────────────────────────
connectDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`✅ CivicSolve API running on http://localhost:${PORT}`);
      console.log(`   Health: http://localhost:${PORT}/api/health`);
    });
  })
  .catch((error) => {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  });
