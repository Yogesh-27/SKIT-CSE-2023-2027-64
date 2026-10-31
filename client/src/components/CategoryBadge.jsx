/**
 * CivicSolve — Category Badge Component
 *
 * Displays a coloured badge for an issue category.
 *
 * Author: Kuldeep Singh Rathore (Member 3) — Frontend Development
 */

const CATEGORY_COLORS = {
  "Roads & Potholes":              "bg-orange-50 text-orange-700 ring-orange-200",
  "Water Supply":                   "bg-blue-50   text-blue-700   ring-blue-200",
  "Sanitation & Garbage":           "bg-yellow-50 text-yellow-700 ring-yellow-200",
  "Electricity & Street Lights":    "bg-purple-50 text-purple-700 ring-purple-200",
  "Drainage & Sewage":              "bg-cyan-50   text-cyan-700   ring-cyan-200",
  "Public Safety":                  "bg-red-50    text-red-700    ring-red-200",
  "Parks & Public Spaces":          "bg-green-50  text-green-700  ring-green-200",
  "General Complaint":              "bg-slate-50  text-slate-700  ring-slate-200"
};

export default function CategoryBadge({ category, className = "" }) {
  const colors = CATEGORY_COLORS[category] ?? CATEGORY_COLORS["General Complaint"];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${colors} ${className}`}
    >
      {category ?? "General Complaint"}
    </span>
  );
}
