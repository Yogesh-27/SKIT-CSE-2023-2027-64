import { Router } from "express";
import {
  createIssue,
  getIssue,
  listIssues,
  updateIssueStatus
} from "../controllers/issueController.js";

const router = Router();

router.get("/", listIssues);
router.get("/:id", getIssue);
router.post("/", createIssue);
router.patch("/:id/status", updateIssueStatus);

export default router;
