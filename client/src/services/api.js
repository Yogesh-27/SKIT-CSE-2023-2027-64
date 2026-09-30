import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json"
  }
});

export async function getIssues() {
  const response = await api.get("/issues");
  return response.data;
}

export async function createIssue(payload) {
  const response = await api.post("/issues", payload);
  return response.data;
}

export async function updateIssueStatus(id, status) {
  const response = await api.patch(`/issues/${id}/status`, { status });
  return response.data;
}
