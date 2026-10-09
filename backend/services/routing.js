// ---------- Priority-Based Department Routing ----------
const DEPARTMENTS = {
  "Roads & Potholes": "Public Works Department (PWD)",
  "Water Supply": "Water Supply Department (PHED)",
  "Sanitation & Garbage": "Municipal Sanitation Department",
  "Electricity & Street Lights": "Electricity Department (DISCOM)",
  "Drainage & Sewage": "Sewerage & Drainage Department",
  "Public Safety": "Police / Disaster Management Cell",
  "Parks & Public Spaces": "Horticulture & Parks Department",
  "General Complaint": "Municipal Help Desk"
};

// time (in hours) in which the department must resolve the issue
const SLA_HOURS = { Critical: 6, High: 24, Medium: 72, Low: 168 };

function route(category, priorityLevel) {
  const slaHours = SLA_HOURS[priorityLevel];
  return {
    department: DEPARTMENTS[category] || DEPARTMENTS["General Complaint"],
    slaHours,
    dueBy: new Date(Date.now() + slaHours * 3600 * 1000).toISOString()
  };
}

// Workflow engine: which status can move to which
const WORKFLOW = {
  Submitted: ["Assigned", "Rejected"],
  Assigned: ["In Progress", "Rejected"],
  "In Progress": ["Resolved"],
  Resolved: [],
  Rejected: []
};

module.exports = { route, WORKFLOW, DEPARTMENTS, SLA_HOURS };
