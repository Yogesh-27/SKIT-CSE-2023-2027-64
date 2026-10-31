/**
 * CivicSolve — Stat Card Component
 *
 * Displays a single KPI metric on the authority dashboard.
 *
 * Author: Kuldeep Singh Rathore (Member 3) — Frontend Development
 */

export default function StatCard({ label, value, hint, accent }) {
  const accentClasses = {
    teal:   "border-teal-200 bg-teal-50",
    red:    "border-red-200 bg-red-50",
    amber:  "border-amber-200 bg-amber-50",
    green:  "border-emerald-200 bg-emerald-50",
    default: "border-slate-200 bg-white"
  };

  const valueClasses = {
    teal:   "text-teal-700",
    red:    "text-red-700",
    amber:  "text-amber-700",
    green:  "text-emerald-700",
    default: "text-slate-900"
  };

  const bg    = accentClasses[accent]  ?? accentClasses.default;
  const color = valueClasses[accent]   ?? valueClasses.default;

  return (
    <div className={`rounded-2xl border p-5 shadow-sm ${bg}`}>
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`mt-2 text-3xl font-bold ${color}`}>{value ?? 0}</p>
      {hint && <p className="mt-2 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}
