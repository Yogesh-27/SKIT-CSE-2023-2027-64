import { useEffect, useMemo, useState } from "react";
import { MapPin, RefreshCw } from "lucide-react";
import { getIssues, updateIssueStatus } from "../services/api";
import StatCard from "../components/StatCard";
import IssueTable from "../components/IssueTable";

export default function Dashboard() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadIssues() {
    try {
      setLoading(true);
      setError("");
      const data = await getIssues();
      setIssues(data.issues);
    } catch {
      setError("Unable to load issues. Make sure the API server and MongoDB are running.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadIssues();
  }, []);

  async function handleStatusChange(id, status) {
    try {
      const data = await updateIssueStatus(id, status);
      setIssues((current) =>
        current.map((issue) => (issue._id === id ? data.issue : issue))
      );
    } catch {
      setError("Could not update the issue status.");
    }
  }

  const stats = useMemo(() => {
    const high = issues.filter((issue) => issue.priority === "high").length;
    const resolved = issues.filter((issue) => issue.status === "resolved").length;

    return {
      total: issues.length,
      high,
      resolved,
      pending: issues.length - resolved
    };
  }, [issues]);

  return (
    <section className="space-y-7">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-semibold text-teal-600">Authority Dashboard</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">Issue Resolution Dashboard</h1>
          <p className="mt-2 max-w-2xl text-slate-500">
            Review citizen reports, inspect automated classification, and manage the current workflow status.
          </p>
        </div>
        <button
          onClick={loadIssues}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold shadow-sm hover:bg-slate-50"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Reports" value={stats.total} hint="All submitted issues" />
        <StatCard label="High Priority" value={stats.high} hint="Requires attention" />
        <StatCard label="Pending" value={stats.pending} hint="Not resolved yet" />
        <StatCard label="Resolved" value={stats.resolved} hint="Marked resolved" />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold">Recent Issue Reports</h2>
            {loading && <span className="text-xs text-slate-500">Loading...</span>}
          </div>
          <IssueTable issues={issues} onStatusChange={handleStatusChange} />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <MapPin size={18} className="text-teal-600" />
            <h2 className="font-bold">Issue Map</h2>
          </div>
          <div className="mt-4 flex h-80 items-center justify-center rounded-xl bg-slate-100">
            <div className="text-center">
              <MapPin className="mx-auto text-slate-400" size={34} />
              <p className="mt-2 font-medium text-slate-600">Map integration placeholder</p>
              <p className="mt-1 text-xs text-slate-400">
                GPS coordinates are stored by the API.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
