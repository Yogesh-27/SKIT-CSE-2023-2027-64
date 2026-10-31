import { useState } from "react";
import CategoryBadge from "./CategoryBadge";

/**
 * CivicSolve — Issue Table Component
 *
 * Displays the list of civic issues with sortable columns and inline status change.
 * Clicking a row opens the IssueDetailModal.
 *
 * Author: Kuldeep Singh Rathore (Member 3) — Frontend Development
 */

const STATUS_STYLES = {
  submitted:   "bg-blue-50 text-blue-700",
  in_review:   "bg-amber-50 text-amber-700",
  assigned:    "bg-violet-50 text-violet-700",
  in_progress: "bg-indigo-50 text-indigo-700",
  resolved:    "bg-emerald-50 text-emerald-700",
  rejected:    "bg-red-50 text-red-700"
};

const PRIORITY_STYLES = {
  critical: "bg-red-600 text-white",
  high:     "bg-red-50 text-red-700",
  medium:   "bg-amber-50 text-amber-700",
  low:      "bg-emerald-50 text-emerald-700"
};

const STATUS_LABELS = {
  submitted:   "Submitted",
  in_review:   "In Review",
  assigned:    "Assigned",
  in_progress: "In Progress",
  resolved:    "Resolved",
  rejected:    "Rejected"
};

// Valid next-status options per current status (mirrors the server workflow)
const STATUS_OPTIONS = {
  submitted:   ["submitted", "in_review", "assigned", "rejected"],
  in_review:   ["in_review", "assigned", "rejected"],
  assigned:    ["assigned", "in_progress", "rejected"],
  in_progress: ["in_progress", "resolved", "assigned"],
  resolved:    ["resolved"],
  rejected:    ["rejected"]
};

export default function IssueTable({ issues, onStatusChange, onRowClick }) {
  const [updatingId, setUpdatingId] = useState(null);

  if (!issues.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
        <p className="font-semibold text-slate-700">No matching reports</p>
        <p className="mt-1 text-sm text-slate-500">Try changing your search or filters.</p>
      </div>
    );
  }

  async function handleStatusChange(issueId, currentStatus, newStatus) {
    if (newStatus === currentStatus) return;
    setUpdatingId(issueId);
    try {
      await onStatusChange(issueId, newStatus);
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th scope="col" className="px-5 py-4 font-semibold text-slate-700">Issue</th>
              <th scope="col" className="px-5 py-4 font-semibold text-slate-700">Category</th>
              <th scope="col" className="px-5 py-4 font-semibold text-slate-700">Priority</th>
              <th scope="col" className="px-5 py-4 font-semibold text-slate-700">Department</th>
              <th scope="col" className="px-5 py-4 font-semibold text-slate-700">Upvotes</th>
              <th scope="col" className="px-5 py-4 font-semibold text-slate-700">Status</th>
            </tr>
          </thead>
          <tbody>
            {issues.map((issue) => (
              <tr
                key={issue._id}
                className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70 cursor-pointer"
                onClick={() => onRowClick?.(issue)}
              >
                {/* Title + description */}
                <td className="px-5 py-4 max-w-xs">
                  <p className="font-medium text-slate-900 leading-snug">{issue.title}</p>
                  <p className="mt-1 max-w-xs truncate text-xs text-slate-500">{issue.description}</p>
                  {issue.createdAt && (
                    <p className="mt-1 text-xs text-slate-400">
                      {new Date(issue.createdAt).toLocaleDateString("en-IN")}
                    </p>
                  )}
                </td>

                {/* Category badge */}
                <td className="px-5 py-4">
                  <CategoryBadge category={issue.category} />
                </td>

                {/* Priority */}
                <td className="px-5 py-4">
                  <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${PRIORITY_STYLES[issue.priority] ?? "bg-slate-100 text-slate-700"}`}>
                    {issue.priority ?? "unknown"}
                    {Number.isFinite(Number(issue.priorityScore)) ? ` (${issue.priorityScore})` : ""}
                  </span>
                </td>

                {/* Department */}
                <td className="px-5 py-4 max-w-[160px]">
                  <p className="text-xs text-slate-600 leading-snug">{issue.department}</p>
                </td>

                {/* Upvotes */}
                <td className="px-5 py-4 text-center">
                  <span className="text-sm font-semibold text-teal-700">{issue.upvotes ?? 0}</span>
                </td>

                {/* Status dropdown — stop propagation so row click doesn't trigger */}
                <td
                  className="px-5 py-4"
                  onClick={(e) => e.stopPropagation()}
                >
                  <label className="sr-only" htmlFor={`status-${issue._id}`}>
                    Status for {issue.title}
                  </label>
                  <select
                    id={`status-${issue._id}`}
                    value={issue.status}
                    disabled={updatingId === issue._id}
                    onChange={(e) => handleStatusChange(issue._id, issue.status, e.target.value)}
                    className={`rounded-full border-0 px-2.5 py-1.5 text-xs font-semibold outline-none ring-teal-500 focus:ring-2 cursor-pointer disabled:opacity-50 ${STATUS_STYLES[issue.status] ?? "bg-slate-100 text-slate-700"}`}
                  >
                    {(STATUS_OPTIONS[issue.status] ?? Object.keys(STATUS_LABELS)).map((value) => (
                      <option key={value} value={value}>
                        {STATUS_LABELS[value] ?? value}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
