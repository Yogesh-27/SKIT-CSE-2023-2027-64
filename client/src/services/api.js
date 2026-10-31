import axios from "axios";

/**
 * CivicSolve — Axios API Client
 *
 * Provides typed helper functions for all backend REST endpoints.
 * The Vite dev server proxies /api requests to http://localhost:5000.
 *
 * Author: Arun Kumar Yadav (Team Lead) — Database & API Integration
 * Frontend integration: Kuldeep Singh Rathore (Member 3)
 */

const api = axios.create({
  baseURL: "/api",
  timeout: 12000,
  headers: { "Content-Type": "application/json" }
});

// ── Issues ───────────────────────────────────────────────────────────────────

/**
 * Fetch all issues.
 * @param {Object} filters - Optional: status, priority, category, department
 */
export async function getIssues(filters = {}) {
  const params = Object.fromEntries(
    Object.entries(filters).filter(
      ([, value]) => value !== undefined && value !== null && value !== "" && value !== "all"
    )
  );
  const { data } = await api.get("/issues", { params });
  return data;
}

/**
 * Fetch a single issue by ID.
 */
export async function getIssue(id) {
  if (!id) throw new Error("An issue ID is required.");
  const { data } = await api.get(`/issues/${encodeURIComponent(id)}`);
  return data;
}

/**
 * Submit a new civic issue.
 * @param {Object} payload - { title, description, latitude?, longitude?, imageUrl? }
 */
export async function createIssue(payload) {
  if (!payload || typeof payload !== "object") {
    throw new Error("A valid issue payload is required.");
  }
  const { data } = await api.post("/issues", payload);
  return data;
}

/**
 * Update an issue's workflow status.
 * @param {string} id
 * @param {string} status - submitted | in_review | assigned | in_progress | resolved | rejected
 * @param {string} [note] - Optional reason for the status change
 */
export async function updateIssueStatus(id, status, note) {
  if (!id || !status) throw new Error("Both issue ID and status are required.");
  const payload = {
    status,
    ...(note?.trim() ? { note: note.trim() } : {})
  };
  const { data } = await api.patch(`/issues/${encodeURIComponent(id)}/status`, payload);
  return data;
}

/**
 * Upvote an existing issue (recalculates priority on server).
 */
export async function upvoteIssue(id) {
  if (!id) throw new Error("An issue ID is required.");
  const { data } = await api.patch(`/issues/${encodeURIComponent(id)}/upvote`);
  return data;
}

// ── Departments ──────────────────────────────────────────────────────────────

/**
 * Fetch all departments and their assigned categories.
 */
export async function getDepartments() {
  const { data } = await api.get("/departments");
  return data;
}

// ── Analytics ────────────────────────────────────────────────────────────────

/**
 * Fetch dashboard analytics summary (KPIs, category breakdown, recent issues).
 */
export async function getAnalyticsSummary() {
  const { data } = await api.get("/analytics/summary");
  return data;
}

// ── Health ───────────────────────────────────────────────────────────────────

/**
 * Check whether the backend API is reachable.
 */
export async function checkApiHealth() {
  const { data } = await api.get("/health");
  return data;
}

export default api;
