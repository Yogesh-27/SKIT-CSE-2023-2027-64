import { Router } from "express";
import {
  createIssue,
  getIssue,
  listIssues,
  updateIssueStatus,
  upvoteIssue
} from "../controllers/issueController.js";

/**
 * CivicSolve — Issue Routes
 *
 * Author: Yogendra Jain (Member 2) — Backend & Workflow Engine
 */

const router = Router();

router.get("/",            listIssues);
router.get("/:id",         getIssue);
router.post("/",           createIssue);
router.patch("/:id/status", updateIssueStatus);
router.patch("/:id/upvote", upvoteIssue);

export default router;
