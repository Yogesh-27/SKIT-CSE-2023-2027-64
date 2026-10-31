import Issue from "../models/Issue.js";

/**
 * CivicSolve — Analytics Controller
 *
 * Provides aggregated statistics for the authority dashboard.
 *
 * Author: Arun Kumar Yadav (Team Lead) — Database & API Integration
 */

// ── Summary analytics ─────────────────────────────────────────────────────────
export async function getSummary(req, res, next) {
  try {
    const [
      total,
      byStatus,
      byCategory,
      byPriority,
      recentIssues,
      resolvedLast7Days
    ] = await Promise.all([
      // Total count
      Issue.countDocuments(),

      // Group by status
      Issue.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),

      // Group by category
      Issue.aggregate([
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),

      // Group by priority
      Issue.aggregate([
        { $group: { _id: "$priority", count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]),

      // 5 most recent issues
      Issue.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("title category priority status createdAt")
        .lean(),

      // Issues resolved in the last 7 days
      Issue.countDocuments({
        status: "resolved",
        updatedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      })
    ]);

    // Compute quick KPI numbers
    const statusMap = Object.fromEntries(byStatus.map(({ _id, count }) => [_id, count]));
    const pending = total - (statusMap.resolved ?? 0) - (statusMap.rejected ?? 0);
    const highPriority =
      (byPriority.find((p) => p._id === "high")?.count ?? 0) +
      (byPriority.find((p) => p._id === "critical")?.count ?? 0);

    res.json({
      kpi: {
        total,
        pending,
        resolved:    statusMap.resolved    ?? 0,
        rejected:    statusMap.rejected    ?? 0,
        highPriority,
        resolvedLast7Days
      },
      byStatus:   byStatus.map(({ _id, count }) => ({ status: _id, count })),
      byCategory: byCategory.map(({ _id, count }) => ({ category: _id, count })),
      byPriority: byPriority.map(({ _id, count }) => ({ priority: _id, count })),
      recentIssues
    });
  } catch (error) {
    next(error);
  }
}
