import { useEffect, useMemo, useState } from "react";
import { Filter, MapPin, RefreshCw, Search, X } from "lucide-react";
import { getIssues, updateIssueStatus } from "../services/api";
import StatCard from "../components/StatCard";
import IssueTable from "../components/IssueTable";

const ALL = "all";

export default function Dashboard() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(ALL);
  const [categoryFilter, setCategoryFilter] = useState(ALL);
  const [priorityFilter, setPriorityFilter] = useState(ALL);

  async function loadIssues() {
    try {
      setLoading(true);
      setError("");
      const data = await getIssues();
      setIssues(Array.isArray(data.issues) ? data.issues : []);
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
      setError("");
      const data = await updateIssueStatus(id, status);
      setIssues((current) =>
        current.map((issue) => (issue._id === id ? data.issue : issue))
      );
    } catch (requestError) {
      setError(requestError.response?.data?.message ?? "Could not update the issue status.");
    }
  }

  const stats = useMemo(() => ({
    total: issues.length,
    high: issues.filter((issue) => issue.priority === "high").length,
    resolved: issues.filter((issue) => issue.status === "resolved").length,
    pending: issues.filter((issue) => issue.status !== "resolved").length
  }), [issues]);

  const categories = useMemo(
    () => [...new Set(issues.map((issue) => issue.category).filter(Boolean))].sort(),
    [issues]
  );

  const filteredIssues = useMemo(() => {
    const term = search.trim().toLowerCase();
    return issues.filter((issue) => {
      const matchesSearch = !term || [
        issue.title,
        issue.description,
        issue.department,
        issue.category
      ].some((value) => String(value ?? "").toLowerCase().includes(term));
      return matchesSearch
        && (statusFilter === ALL || issue.status === statusFilter)
        && (categoryFilter === ALL || issue.category === categoryFilter)
        && (priorityFilter === ALL || issue.priority === priorityFilter);
    });
  }, [issues, search, statusFilter, categoryFilter, priorityFilter]);

  const hasFilters = search || statusFilter !== ALL || categoryFilter !== ALL || priorityFilter !== ALL;
  function clearFilters() {
    setSearch("");
    setStatusFilter(ALL);
    setCategoryFilter(ALL);
    setPriorityFilter(ALL);
  }

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
          type="button"
          onClick={loadIssues}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold shadow-sm hover:bg-slate-50 disabled:cursor-wait disabled:opacity-60"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {error && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
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
        <div className="min-w-0">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold">Issue Reports</h2>
              <p className="text-sm text-slate-500">
                Showing {filteredIssues.length} of {issues.length} reports
              </p>
            </div>
            {loading && <span className="text-xs text-slate-500">Loading reports...</span>}
          </div>

          <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Filter size={16} className="text-teal-600" />
              Search and filter
            </div>
            <label className="relative block">
              <span className="sr-only">Search reports</span>
              <Search size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search title, description, category, department..."
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              />
            </label>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <label className="text-xs font-semibold text-slate-600">
                Status
                <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-normal text-slate-800 outline-none focus:border-teal-500">
                  <option value={ALL}>All statuses</option>
                  <option value="submitted">Submitted</option>
                  <option value="in_review">In review</option>
                  <option value="assigned">Assigned</option>
                  <option value="resolved">Resolved</option>
                </select>
              </label>
              <label className="text-xs font-semibold text-slate-600">
                Category
                <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-normal text-slate-800 outline-none focus:border-teal-500">
                  <option value={ALL}>All categories</option>
                  {categories.map((category) => <option key={category} value={category}>{category.replaceAll("_", " ")}</option>)}
                </select>
              </label>
              <label className="text-xs font-semibold text-slate-600">
                Priority
                <select value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-normal text-slate-800 outline-none focus:border-teal-500">
                  <option value={ALL}>All priorities</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </label>
            </div>
            {hasFilters && (
              <button type="button" onClick={clearFilters} className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-900">
                <X size={14} /> Clear filters
              </button>
            )}
          </div>

          <IssueTable issues={filteredIssues} onStatusChange={handleStatusChange} />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <MapPin size={18} className="text-teal-600" />
            <h2 className="font-bold">Reported Locations</h2>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Open a report location in OpenStreetMap. Only reports with GPS coordinates are listed.
          </p>
          <div className="mt-4 space-y-3">
            {issues.filter((issue) => Number.isFinite(Number(issue.location?.latitude))
              && Number.isFinite(Number(issue.location?.longitude))
              && issue.location?.latitude !== null
              && issue.location?.longitude !== null).length === 0 ? (
              <div className="flex min-h-40 flex-col items-center justify-center rounded-xl bg-slate-50 px-4 text-center">
                <MapPin className="text-slate-400" size={30} />
                <p className="mt-2 text-sm font-medium text-slate-600">No locations available</p>
                <p className="mt-1 text-xs text-slate-400">GPS coordinates will appear here when provided.</p>
              </div>
            ) : issues.filter((issue) => issue.location?.latitude != null && issue.location?.longitude != null).slice(0, 8).map((issue) => (
              <div key={issue._id} className="flex items-start justify-between gap-3 rounded-xl border border-slate-100 p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-800">{issue.title}</p>
                  <p className="mt-1 text-xs text-slate-500">{Number(issue.location.latitude).toFixed(4)}, {Number(issue.location.longitude).toFixed(4)}</p>
                </div>
                <a
                  href={`https://www.openstreetmap.org/?mlat=${encodeURIComponent(issue.location.latitude)}&mlon=${encodeURIComponent(issue.location.longitude)}#map=17/${encodeURIComponent(issue.location.latitude)}/${encodeURIComponent(issue.location.longitude)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="shrink-0 rounded-lg bg-teal-50 px-2.5 py-1.5 text-xs font-semibold text-teal-700 hover:bg-teal-100"
                >
                  View map
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
