import { Check, Clock, AlertCircle, Wrench, ShieldAlert } from "lucide-react";

/**
 * CivicSolve — Status Stepper Component
 *
 * Visual progress stepper representing complaint lifecycle stages:
 * Submitted -> In Review -> Assigned -> In Progress -> Resolved
 *
 * Author: Kuldeep Singh Rathore (Member 3) — Frontend Development
 */

const STEPS = [
  { key: "submitted",   label: "Submitted",   icon: Clock,        desc: "Issue reported" },
  { key: "in_review",   label: "In Review",   icon: Clock,        desc: "Under inspection" },
  { key: "assigned",    label: "Assigned",    icon: Wrench,       desc: "Sent to department" },
  { key: "in_progress", label: "In Progress", icon: Wrench,       desc: "Action underway" },
  { key: "resolved",    label: "Resolved",    icon: Check,        desc: "Issue fixed" }
];

const ORDER = ["submitted", "in_review", "assigned", "in_progress", "resolved"];

export default function StatusStepper({ currentStatus = "submitted", className = "" }) {
  if (currentStatus === "rejected") {
    return (
      <div className={`flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 ${className}`}>
        <ShieldAlert size={20} className="shrink-0 text-red-600" />
        <div>
          <p className="font-semibold text-sm">Complaint Status: Rejected</p>
          <p className="text-xs text-red-600">This report has been reviewed and closed as invalid or duplicate.</p>
        </div>
      </div>
    );
  }

  const currentIndex = ORDER.indexOf(currentStatus);
  const activeIndex = currentIndex === -1 ? 0 : currentIndex;

  return (
    <div className={`w-full py-2 ${className}`}>
      <div className="relative flex items-center justify-between">
        {/* Connecting Line */}
        <div className="absolute left-6 right-6 top-4 -translate-y-1/2 h-1 bg-slate-200 z-0">
          <div
            className="h-full bg-teal-500 transition-all duration-500"
            style={{ width: `${(activeIndex / (STEPS.length - 1)) * 100}%` }}
          />
        </div>

        {/* Steps */}
        {STEPS.map((step, idx) => {
          const isDone = idx < activeIndex;
          const isCurrent = idx === activeIndex;
          const Icon = step.icon;

          return (
            <div key={step.key} className="relative z-10 flex flex-col items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-semibold transition-all ${
                  isDone
                    ? "border-teal-500 bg-teal-500 text-white shadow-sm"
                    : isCurrent
                    ? "border-teal-600 bg-white text-teal-600 ring-4 ring-teal-100 shadow-md"
                    : "border-slate-300 bg-white text-slate-400"
                }`}
              >
                {isDone ? <Check size={14} strokeWidth={3} /> : <Icon size={14} />}
              </div>
              <p
                className={`mt-2 text-xs font-medium text-center ${
                  isCurrent
                    ? "text-teal-700 font-bold"
                    : isDone
                    ? "text-slate-800"
                    : "text-slate-400"
                }`}
              >
                {step.label}
              </p>
              <span className="hidden sm:block text-[10px] text-slate-400 text-center">
                {step.desc}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
