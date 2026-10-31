import { NavLink, Route, Routes } from "react-router-dom";
import { LayoutDashboard, PlusCircle, ShieldCheck } from "lucide-react";
import Dashboard from "./pages/Dashboard";
import ReportIssue from "./pages/ReportIssue";

/**
 * CivicSolve — Root Application Component
 *
 * Renders the top navigation bar and the main page routes:
 *   /        → Authority Dashboard
 *   /report  → Citizen Report Form
 *
 * Author: Kuldeep Singh Rathore (Member 3) — Frontend Development
 */

function Navigation() {
  const linkClass = ({ isActive }) =>
    `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
      isActive
        ? "bg-teal-600 text-white"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        {/* Logo */}
        <NavLink to="/" className="flex items-center gap-2.5">
          <div className="rounded-xl bg-teal-600 p-2 text-white">
            <ShieldCheck size={20} />
          </div>
          <div>
            <p className="text-lg font-bold text-slate-900 leading-none">CivicSolve</p>
            <p className="text-xs text-slate-500">Civic Issue Reporting</p>
          </div>
        </NavLink>

        {/* Navigation links */}
        <nav className="flex items-center gap-2">
          <NavLink to="/" end className={linkClass}>
            <LayoutDashboard size={17} />
            Dashboard
          </NavLink>
          <NavLink to="/report" className={linkClass}>
            <PlusCircle size={17} />
            Report Issue
          </NavLink>
        </nav>
      </div>
    </header>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navigation />
      <main className="mx-auto max-w-7xl px-6 py-8">
        <Routes>
          <Route path="/"       element={<Dashboard />} />
          <Route path="/report" element={<ReportIssue />} />
        </Routes>
      </main>
    </div>
  );
}
