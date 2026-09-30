const departments = [
  {
    name: "Roads & Infrastructure",
    categories: ["roads"]
  },
  {
    name: "Sanitation",
    categories: ["sanitation"]
  },
  {
    name: "Water Supply",
    categories: ["water"]
  },
  {
    name: "Public Utilities",
    categories: ["public_utilities"]
  },
  {
    name: "Drainage & Sewerage",
    categories: ["drainage"]
  },
  {
    name: "General Civic Services",
    categories: ["other"]
  }
];

export function listDepartments(req, res) {
  res.json({ departments });
}
