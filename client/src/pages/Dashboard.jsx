import { useEffect, useMemo, useState } from "react";
import { Filter, RefreshCw, Search, X } from "lucide-react";
import { getIssues, updateIssueStatus, getAnalyticsSummary } from "../services/api";
import StatCard from "../components/StatCard";
import IssueTable from "../components/IssueTable";
import IssueDetailModal from "../components/IssueDetailModal";

/**
 * CivicSolve — Authority Dashboard
 *
 * Displays all submitted civic issues with:
 * - KPI stat cards (from analytics endpoint)
 * - Search + filter controls
 * - Issue table with inline status changes
 * - Issue detail modal
 *
 * Author: Kuldeep Singh Rathore (Member 3) — Frontend Development
 * API integration: Arun Kumar Yadav (Team Lead)
 */

const ALL = "all";

const STATUS_OPTIONS = [
  { value: ALL,          label: "All Statuses" },
  { value: "submitted",  label: "Submitted" },
  { value: "in_review",  label: "In Review" },
  { value: "assigned",   label: "Assigned" },
  { value: "in_progress", label: "In Progress" },
  { value: "resolved",   label: "Resolved" },
  { value: "rejected",   label: "Rejected" }
];

const PRIORITY_OPTIONS = [
  { value: ALL,        label: "All Priorities" },
  { value: "critical", label: "Critical" },
  { value: "high",     label: "High" },
  { value: "medium",   label: "Medium" },
  { value: "low",      label: "Low" }
];

export default function Dashboard() {
  const [issues,        setIssues]        = useState([]);
  const [analytics,     setAnalytics]     = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState("");
  const [search,        setSearch]        = useState("");
  const [statusFilter,  setStatusFilter]  = useState(ALL);
  const [categoryFilter, setCategoryFilter] = useState(ALL);
  const [priorityFilter, setPriorityFilter] = useState(ALL);
  const [selectedIssue, setSelectedIssue] = useState(null);

  // ── Load data ─────────────────────────────────────────────────────────────
  async function loadData() {
    try {
      setLoading(true);
      setError("");
      const [issuesData, analyticsData] = await Promise.all([
        getIssues(),
        getAnalyticsSummary().catch(() => null)
      ]);
      setIssues(Array.isArray(issuesData.issues) ? issuesData.issues : []);
      setAnalytics(analyticsData ?? null);
    } catch {
      setError("Unable to load issues. Make sure the API server and MongoDB are running.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, []);

  // ── Status change ─────────────────────────────────────────────────────────
  async function handleStatusChange(id, status) {
    try {
      setError("");
      const data = await updateIssueStatus(id, status);
      setIssues((current) =>
        current.map((issue) => (issue._id === id ? data.issue : issue))
      );
      // Keep modal in sync
      if (selectedIssue?._id === id) setSelectedIssue(data.issue);
    } catch (err) {
      setError(err.response?.data?.message ?? "Could not update the issue status.");
    }
  }

  // ── Issue updated (e.g. upvoted) ──────────────────────────────────────────
  function handleIssueUpdated(updatedIssue) {
    setIssues((current) =>
      current.map((issue) => (issue._id === updatedIssue._id ? updatedIssue : issue))
    );
    setSelectedIssue(updatedIssue);
  }

  // ── KPI stats (use analytics if available, else compute locally) ──────────
  const stats = useMemo(() => {
    if (analytics?.kpi) return analytics.kpi;
    return {
      total:       issues.length,
      highPriority: issues.filter((i) => ["high", "critical"].includes(i.priority)).length,
      resolved:    issues.filter((i) => i.status === "resolved").length,
      pending:     issues.filter((i) => !["resolved", "rejected"].includes(i.status)).length
    };
  }, [issues, analytics]);

  // ── Categories for filter dropdown ────────────────────────────────────────
  const categories = useMemo(
    () => [...new Set(issues.map((i) => i.category).filter(Boolean))].sort(),
    [issues]
  );

  // ── Filter issues ─────────────────────────────────────────────────────────
  const filteredIssues = useMemo(() => {
    const term = search.trim().toLowerCase();
    return issues.filter((issue) => {
      const matchesSearch =
        !term ||
        [issue.title, issue.description, issue.department, issue.category].some(
          (v) => String(v ?? "").toLowerCase().includes(term)
        );
      return (
        matchesSearch &&
        (statusFilter  === ALL || issue.status   === statusFilter) &&
        (categoryFilter === ALL || issue.category === categoryFilter) &&
        (priorityFilter === ALL || issue.priority === priorityFilter)
      );
    });
  }, [issues, search, statusFilter, categoryFilter, priorityFilter]);

  const hasFilters =
    search || statusFilter !== ALL || categoryFilter !== ALL || priorityFilter !== ALL;

  function clearFilters() {
    setSearch("");
    setStatusFilter(ALL);
    setCategoryFilter(ALL);
    setPriorityFilter(ALL);
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <section className="space-y-7">

      {/* Page header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-semibold text-teal-600">Authority Dashboard</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">Issue Resolution Dashboard</h1>
          <p className="mt-2 max-w-2xl text-slate-500">
            Review citizen reports, inspect automated classification, and manage issue workflows.
          </p>
        </div>
        <button
          type="button"
          onClick={loadData}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold shadow-sm hover:bg-slate-50 disabled:cursor-wait disabled:opacity-60"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Error banner */}
      {error && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* KPI Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Reports"  value={stats.total}        hint="All submitted issues" />
        <StatCard label="High Priority"  value={stats.highPriority} hint="Requires attention"   accent="red" />
        <StatCard label="Pending"        value={stats.pending}      hint="Not yet resolved"      accent="amber" />
        <StatCard label="Resolved"       value={stats.resolved}     hint="Issues closed"         accent="green" />
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search issues…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-9 pr-4 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
          />
        </div>

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
        >
          {STATUS_OPTIONS.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>

        {/* Category filter */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
        >
          <option value={ALL}>All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        {/* Priority filter */}
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
        >
          {PRIORITY_OPTIONS.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>

        {/* Clear filters */}
        {hasFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            <X size={14} /> Clear
          </button>
        )}
      </div>

      {/* Result count */}
      <p className="text-sm text-slate-500">
        Showing {filteredIssues.length} of {issues.length} issue{issues.length !== 1 ? "s" : ""}
        {hasFilters && " (filtered)"}
      </p>

      {/* Issue table */}
      <IssueTable
        issues={filteredIssues}
        onStatusChange={handleStatusChange}
        onRowClick={setSelectedIssue}
      />

      {/* Issue detail modal */}
      {selectedIssue && (
        <IssueDetailModal
          issue={selectedIssue}
          onClose={() => setSelectedIssue(null)}
          onIssueUpdated={handleIssueUpdated}
        />
      )}
    </section>
  );
}
