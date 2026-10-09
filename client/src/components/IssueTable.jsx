const statusStyles = {
  submitted: "bg-blue-50 text-blue-700",
  in_review: "bg-amber-50 text-amber-700",
  assigned: "bg-violet-50 text-violet-700",
  resolved: "bg-emerald-50 text-emerald-700"
};

const priorityStyles = {
  high: "bg-red-50 text-red-700",
  medium: "bg-amber-50 text-amber-700",
  low: "bg-emerald-50 text-emerald-700"
};

const statusLabels = {
  submitted: "Submitted",
  in_review: "In Review",
  assigned: "Assigned",
  resolved: "Resolved"
};

export default function IssueTable({ issues, onStatusChange }) {
  if (!issues.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
        <p className="font-semibold text-slate-700">No matching reports</p>
        <p className="mt-1 text-sm text-slate-500">Try changing your search or filters.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th scope="col" className="px-5 py-4 font-semibold">Issue</th>
              <th scope="col" className="px-5 py-4 font-semibold">Category</th>
              <th scope="col" className="px-5 py-4 font-semibold">Priority</th>
              <th scope="col" className="px-5 py-4 font-semibold">Department</th>
              <th scope="col" className="px-5 py-4 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {issues.map((issue) => (
              <tr key={issue._id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70">
                <td className="px-5 py-4">
                  <p className="font-medium text-slate-900">{issue.title}</p>
                  <p className="mt-1 max-w-sm truncate text-xs text-slate-500">{issue.description}</p>
                  {issue.createdAt && (
                    <p className="mt-1 text-xs text-slate-400">
                      {new Date(issue.createdAt).toLocaleDateString()}
                    </p>
                  )}
                </td>
                <td className="px-5 py-4 capitalize">{String(issue.category ?? "other").replaceAll("_", " ")}</td>
                <td className="px-5 py-4">
                  <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${priorityStyles[issue.priority] ?? "bg-slate-100 text-slate-700"}`}>
                    {issue.priority ?? "unknown"}{Number.isFinite(Number(issue.priorityScore)) ? ` (${issue.priorityScore})` : ""}
                  </span>
                </td>
                <td className="px-5 py-4">{issue.department}</td>
                <td className="px-5 py-4">
                  <label className="sr-only" htmlFor={`status-${issue._id}`}>Status for {issue.title}</label>
                  <select
                    id={`status-${issue._id}`}
                    value={issue.status}
                    onChange={(event) => onStatusChange(issue._id, event.target.value)}
                    className={`rounded-full border-0 px-2.5 py-1.5 text-xs font-semibold outline-none ring-teal-500 focus:ring-2 ${statusStyles[issue.status] ?? "bg-slate-100 text-slate-700"}`}
                  >
                    {Object.entries(statusLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
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
