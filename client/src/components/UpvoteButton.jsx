import { useState } from "react";
import { ThumbsUp } from "lucide-react";
import { upvoteIssue } from "../services/api";

/**
 * CivicSolve — Upvote Button Component
 *
 * Allows citizens or authority users to upvote an existing issue,
 * which recalculates its priority score on the server.
 *
 * Author: Kuldeep Singh Rathore (Member 3) — Frontend Development
 * API integration: Arun Kumar Yadav (Team Lead)
 */

export default function UpvoteButton({ issueId, initialUpvotes = 0, onUpvoted }) {
  const [upvotes, setUpvotes]   = useState(initialUpvotes);
  const [loading, setLoading]   = useState(false);
  const [voted, setVoted]       = useState(false);
  const [error, setError]       = useState("");

  async function handleUpvote() {
    if (voted || loading) return;
    try {
      setLoading(true);
      setError("");
      const data = await upvoteIssue(issueId);
      setUpvotes(data.issue.upvotes);
      setVoted(true);
      onUpvoted?.(data.issue);
    } catch {
      setError("Could not upvote. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={handleUpvote}
        disabled={voted || loading}
        title={voted ? "You have already upvoted this issue" : "Upvote this issue"}
        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition
          ${voted
            ? "bg-teal-50 text-teal-700 cursor-default"
            : "bg-slate-100 text-slate-700 hover:bg-teal-50 hover:text-teal-700"
          }
          disabled:opacity-60`}
      >
        <ThumbsUp size={14} className={loading ? "animate-bounce" : ""} />
        {upvotes} {upvotes === 1 ? "upvote" : "upvotes"}
        {voted && <span className="text-xs">(voted)</span>}
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
