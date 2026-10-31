import { X, MapPin, Clock, AlertTriangle, CheckCircle2, ThumbsUp, Tag, Building2, ChevronRight } from "lucide-react";
import CategoryBadge from "./CategoryBadge";
import UpvoteButton from "./UpvoteButton";
import StatusStepper from "./StatusStepper";

/**
 * CivicSolve — Issue Detail Modal
 *
 * Shows full information about a single civic issue including:
 * - Title, description, category, department
 * - Priority score and reasons
 * - GPS location
 * - Status history timeline
 * - Upvote button
 *
 * Author: Kuldeep Singh Rathore (Member 3) — Frontend Development
 */

const STATUS_STYLES = {
  submitted:   "bg-blue-50 text-blue-700 border-blue-200",
  in_review:   "bg-amber-50 text-amber-700 border-amber-200",
  assigned:    "bg-violet-50 text-violet-700 border-violet-200",
  in_progress: "bg-indigo-50 text-indigo-700 border-indigo-200",
  resolved:    "bg-emerald-50 text-emerald-700 border-emerald-200",
  rejected:    "bg-red-50 text-red-700 border-red-200"
};

const STATUS_LABELS = {
  submitted:   "Submitted",
  in_review:   "In Review",
  assigned:    "Assigned",
  in_progress: "In Progress",
  resolved:    "Resolved",
  rejected:    "Rejected"
};

const PRIORITY_STYLES = {
  critical: "bg-red-600 text-white",
  high:     "bg-red-50 text-red-700",
  medium:   "bg-amber-50 text-amber-700",
  low:      "bg-emerald-50 text-emerald-700"
};

function formatDate(dateString) {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleString("en-IN", {
    day:    "2-digit",
    month:  "short",
    year:   "numeric",
    hour:   "2-digit",
    minute: "2-digit"
  });
}

export default function IssueDetailModal({ issue, onClose, onIssueUpdated }) {
  if (!issue) return null;

  const hasLocation =
    issue.location?.latitude != null && issue.location?.longitude != null;

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Issue details: ${issue.title}`}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Modal panel */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl">

        {/* Header */}
        <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-slate-200 bg-white px-6 py-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <CategoryBadge category={issue.category} />
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${PRIORITY_STYLES[issue.priority] ?? "bg-slate-100 text-slate-700"}`}>
                {issue.priority?.toUpperCase()} · Score: {issue.priorityScore}
              </span>
              <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[issue.status] ?? "bg-slate-50 text-slate-700 border-slate-200"}`}>
                {STATUS_LABELS[issue.status] ?? issue.status}
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 leading-snug">{issue.title}</h2>
            <p className="mt-0.5 text-xs text-slate-400">
              Submitted {formatDate(issue.createdAt)}
              {issue._id && <> · ID: <span className="font-mono">{issue._id}</span></>}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">

          {/* Workflow Status Stepper */}
          <section className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Workflow Status Progression
            </h3>
            <StatusStepper currentStatus={issue.status} />
          </section>

          {/* Description */}
          <section>
            <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">Description</h3>
            <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">{issue.description}</p>
          </section>

          {/* Department & Classification */}
          <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-slate-500 mb-1">
                <Building2 size={14} />
                <span className="text-xs font-semibold uppercase tracking-wide">Routed To</span>
              </div>
              <p className="text-sm font-medium text-slate-800">{issue.department}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-slate-500 mb-1">
                <Tag size={14} />
                <span className="text-xs font-semibold uppercase tracking-wide">Classifier Confidence</span>
              </div>
              <p className="text-sm font-medium text-slate-800">
                {issue.confidence != null ? `${Math.round(issue.confidence * 100)}%` : "—"}
              </p>
              {issue.matchedKeywords?.length > 0 && (
                <p className="mt-1 text-xs text-slate-500">
                  Keywords: {issue.matchedKeywords.slice(0, 5).join(", ")}
                </p>
              )}
            </div>
          </section>

          {/* Priority Reasons */}
          {issue.priorityReasons?.length > 0 && (
            <section>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400 flex items-center gap-1.5">
                <AlertTriangle size={12} /> Priority Scoring Breakdown
              </h3>
              <ul className="space-y-1">
                {issue.priorityReasons.map((reason, index) => (
                  <li key={index} className="flex items-start gap-2 text-xs text-slate-600">
                    <ChevronRight size={12} className="mt-0.5 shrink-0 text-teal-500" />
                    {reason}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* SLA */}
          {issue.dueBy && (
            <section>
              <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3">
                <Clock size={14} className="shrink-0 text-amber-600" />
                <div className="text-xs">
                  <span className="font-semibold text-amber-800">SLA deadline: </span>
                  <span className="text-amber-700">{formatDate(issue.dueBy)}</span>
                  {issue.slaHours && (
                    <span className="ml-1 text-amber-600">({issue.slaHours}h SLA)</span>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* GPS Location */}
          {hasLocation && (
            <section>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400 flex items-center gap-1.5">
                <MapPin size={12} /> GPS Location
              </h3>
              <div className="flex items-center gap-3">
                <p className="text-sm font-mono text-slate-600">
                  {issue.location.latitude.toFixed(6)}, {issue.location.longitude.toFixed(6)}
                </p>
                <a
                  href={`https://www.google.com/maps?q=${issue.location.latitude},${issue.location.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-teal-600 hover:underline"
                >
                  View on Maps →
                </a>
              </div>
            </section>
          )}

          {/* Image */}
          {issue.imageUrl && (
            <section>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Photo Evidence</h3>
              <img
                src={issue.imageUrl}
                alt="Issue evidence"
                className="w-full max-h-64 rounded-xl object-cover border border-slate-200"
              />
            </section>
          )}

          {/* Upvote */}
          <section className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div>
              <p className="text-sm font-semibold text-slate-700">Community Support</p>
              <p className="text-xs text-slate-500">Upvoting increases the priority of this issue.</p>
            </div>
            <UpvoteButton
              issueId={issue._id}
              initialUpvotes={issue.upvotes ?? 0}
              onUpvoted={onIssueUpdated}
            />
          </section>

          {/* History timeline */}
          {issue.history?.length > 0 && (
            <section>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Status History</h3>
              <ol className="relative ml-3 border-l border-slate-200 space-y-4">
                {[...issue.history].reverse().map((entry, index) => (
                  <li key={index} className="ml-4">
                    <div className="absolute -left-[7px] mt-1 h-3 w-3 rounded-full border-2 border-white bg-teal-400" />
                    <p className="text-xs font-semibold text-slate-700">
                      {STATUS_LABELS[entry.status] ?? entry.status}
                    </p>
                    {entry.note && (
                      <p className="mt-0.5 text-xs text-slate-500">{entry.note}</p>
                    )}
                    <p className="mt-0.5 text-xs text-slate-400">{formatDate(entry.at)}</p>
                  </li>
                ))}
              </ol>
            </section>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 border-t border-slate-200 bg-white px-6 py-4 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
