const statusStyles = {
  submitted: "bg-blue-50 text-blue-700",
  in_review: "bg-amber-50 text-amber-700",
  assigned: "bg-violet-50 text-violet-700",
  resolved: "bg-emerald-50 text-emerald-700"
};

export default function IssueTable({ issues, onStatusChange }) {
  if (!issues.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
        No civic issues have been reported yet.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="px-5 py-4 font-semibold">Issue</th>
              <th className="px-5 py-4 font-semibold">Category</th>
              <th className="px-5 py-4 font-semibold">Priority</th>
              <th className="px-5 py-4 font-semibold">Department</th>
              <th className="px-5 py-4 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {issues.map((issue) => (
              <tr key={issue._id} className="border-b border-slate-100 last:border-0">
                <td className="px-5 py-4">
                  <p className="font-medium text-slate-900">{issue.title}</p>
                  <p className="mt-1 max-w-sm truncate text-xs text-slate-500">
                    {issue.description}
                  </p>
                </td>
                <td className="px-5 py-4 capitalize">{issue.category}</td>
                <td className="px-5 py-4">
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold">
                    {issue.priority} ({issue.priorityScore})
                  </span>
                </td>
                <td className="px-5 py-4">{issue.department}</td>
                <td className="px-5 py-4">
                  <select
                    value={issue.status}
                    onChange={(event) => onStatusChange(issue._id, event.target.value)}
                    className={`rounded-full border-0 px-2.5 py-1 text-xs font-semibold outline-none ${
                      statusStyles[issue.status] ?? "bg-slate-100 text-slate-700"
                    }`}
                  >
                    <option value="submitted">Submitted</option>
                    <option value="in_review">In Review</option>
                    <option value="assigned">Assigned</option>
                    <option value="resolved">Resolved</option>
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
