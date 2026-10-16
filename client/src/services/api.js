
import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json"
  }
});

/**
 * Fetch all issues.
 * Optional filters: status, priority, category, department.
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
 * Fetch a single issue by its ID.
 */
export async function getIssue(id) {
  if (!id) {
    throw new Error("An issue ID is required.");
  }

  const { data } = await api.get(`/issues/${encodeURIComponent(id)}`);
  return data;
}

/**
 * Submit a new civic issue.
 * Expected fields: title, description, latitude, longitude, imageUrl.
 */
export async function createIssue(payload) {
  if (!payload || typeof payload !== "object") {
    throw new Error("A valid issue payload is required.");
  }

  const { data } = await api.post("/issues", payload);
  return data;
}

/**
 * Update an issue's status.
 * Optional note records the reason for the status change.
 */
export async function updateIssueStatus(id, status, note) {
  if (!id || !status) {
    throw new Error("Both issue ID and status are required.");
  }

  const payload = {
    status,
    ...(note?.trim() ? { note: note.trim() } : {})
  };

  const { data } = await api.patch(
    `/issues/${encodeURIComponent(id)}/status`,
    payload
  );

  return data;
}

/**
 * Fetch departments and their assigned issue categories.
 */
export async function getDepartments() {
  const { data } = await api.get("/departments");
  return data;
}

/**
 * Check whether the backend API is reachable.
 */
export async function checkApiHealth() {
  const { data } = await api.get("/health");
  return data;
}

export default api;
