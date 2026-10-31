import { useState } from "react";
import { Search, Clock, Building2, MapPin, AlertCircle, FileText } from "lucide-react";
import { getIssue } from "../services/api";
import StatusStepper from "../components/StatusStepper";
import CategoryBadge from "../components/CategoryBadge";

/**
 * CivicSolve — Track Complaint Status Page
 *
 * Allows citizens to enter their Complaint Reference ID and view
 * the live resolution status, stepper progression, and SLA timeline.
 *
 * Author: Kuldeep Singh Rathore (Member 3) — Frontend Development
 */

export default function TrackStatus() {
  const [queryId, setQueryId] = useState("");
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSearch(e) {
    e.preventDefault();
    const id = queryId.trim();
    if (!id) {
      setError("Please enter a valid complaint ID.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setIssue(null);
      const data = await getIssue(id);
      if (data?.issue) {
        setIssue(data.issue);
      } else {
        setError("No complaint found with this Reference ID.");
      }
    } catch (err) {
      setError(
        err.response?.status === 404
          ? "No complaint found with this Reference ID. Please check the ID and try again."
          : "Unable to connect to the server. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  }

  function formatDate(dateStr) {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Page Title */}
      <div className="text-center">
        <p className="text-sm font-semibold text-teal-600">Citizen Services</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
          Track Your Civic Complaint
        </h1>
        <p className="mt-2 text-slate-500 max-w-xl mx-auto">
          Enter your reference ID below to monitor the real-time resolution progress
          and department handling.
        </p>
      </div>

      {/* Search Input Box */}
      <form
        onSubmit={handleSearch}
        className="flex gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm"
      >
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={queryId}
            onChange={(e) => setQueryId(e.target.value)}
            placeholder="Enter Complaint Reference ID (e.g., 6723a9f...)"
            className="w-full rounded-xl py-3 pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-teal-100"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-teal-600 px-6 py-3 font-semibold text-white shadow-sm hover:bg-teal-700 disabled:opacity-50"
        >
          {loading ? "Searching..." : "Track Status"}
        </button>
      </form>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={18} className="shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Issue Status Details Card */}
      {issue && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <CategoryBadge category={issue.category} />
                <span className="text-xs text-slate-400 font-mono">ID: {issue._id}</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900">{issue.title}</h2>
              <p className="mt-0.5 text-xs text-slate-400">
                Submitted on {formatDate(issue.createdAt)}
              </p>
            </div>
            <div className="text-right">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase text-slate-700">
                Priority: {issue.priority}
              </span>
            </div>
          </div>

          {/* Visual Progress Stepper */}
          <div className="py-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">
              Complaint Resolution Progress
            </h3>
            <StatusStepper currentStatus={issue.status} />
          </div>

          {/* Description */}
          <div className="rounded-xl bg-slate-50 p-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Description
            </h4>
            <p className="text-sm text-slate-700 whitespace-pre-wrap">{issue.description}</p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-200 p-4 flex items-start gap-3">
              <Building2 size={18} className="shrink-0 text-teal-600 mt-0.5" />
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase">Assigned Department</p>
                <p className="text-sm font-medium text-slate-800">{issue.department}</p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 p-4 flex items-start gap-3">
              <Clock size={18} className="shrink-0 text-teal-600 mt-0.5" />
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase">Resolution SLA Target</p>
                <p className="text-sm font-medium text-slate-800">
                  {issue.dueBy ? formatDate(issue.dueBy) : `${issue.slaHours || 72} Hours`}
                </p>
              </div>
            </div>
          </div>

          {/* Location info if present */}
          {issue.location?.latitude != null && (
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <MapPin size={14} className="text-slate-400" />
              <span>
                Coordinates: {issue.location.latitude.toFixed(4)}, {issue.location.longitude.toFixed(4)}
              </span>
            </div>
          )}

          {/* Timeline History */}
          {issue.history?.length > 0 && (
            <div className="border-t border-slate-100 pt-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                Action Log & Audit Trail
              </h4>
              <ul className="space-y-3">
                {[...issue.history].reverse().map((entry, index) => (
                  <li key={index} className="flex items-start gap-3 text-xs">
                    <span className="font-semibold text-slate-700 capitalize min-w-[90px]">
                      {entry.status.replace("_", " ")}
                    </span>
                    <span className="text-slate-500 flex-1">{entry.note || "Status updated"}</span>
                    <span className="text-slate-400">{formatDate(entry.at)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
