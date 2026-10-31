import { Router } from "express";
import { getSummary } from "../controllers/analyticsController.js";

/**
 * CivicSolve — Analytics Routes
 *
 * Author: Arun Kumar Yadav (Team Lead) — Database & API Integration
 */

const router = Router();

router.get("/summary", getSummary);

export default router;
