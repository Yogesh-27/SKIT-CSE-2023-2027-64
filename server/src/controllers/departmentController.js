import { CATEGORIES, routeDepartment } from "../services/classificationEngine.js";

export function listDepartments(req, res) {
  const grouped = new Map();
  for (const category of Object.keys(CATEGORIES)) {
    const name = routeDepartment(category);
    if (!grouped.has(name)) grouped.set(name, []);
    grouped.get(name).push(category);
  }
  res.json({ departments: [...grouped].map(([name, categories]) => ({ name, categories })) });
}
