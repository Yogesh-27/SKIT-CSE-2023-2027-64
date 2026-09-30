import { useState } from "react";
import { CheckCircle2, MapPin } from "lucide-react";
import { createIssue } from "../services/api";

const initialForm = {
  title: "",
  description: "",
  latitude: "",
  longitude: ""
};

export default function ReportIssue() {
  const [form, setForm] = useState(initialForm);
  const [locationLoading, setLocationLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  function updateField(event) {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value
    }));
  }

  function getLocation() {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser.");
      return;
    }

    setLocationLoading(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setForm((current) => ({
          ...current,
          latitude: coords.latitude.toFixed(6),
          longitude: coords.longitude.toFixed(6)
        }));
        setLocationLoading(false);
      },
      () => {
        setError("Could not access your location. You can enter coordinates manually.");
        setLocationLoading(false);
      }
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setResult(null);
    setError("");

    try {
      const data = await createIssue({
        ...form,
        latitude: form.latitude ? Number(form.latitude) : null,
        longitude: form.longitude ? Number(form.longitude) : null
      });

      setResult(data.issue);
      setForm(initialForm);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ??
          "Could not submit the report. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mx-auto max-w-3xl">
      <div className="mb-7">
        <p className="text-sm font-semibold text-teal-600">Citizen Portal</p>
        <h1 className="mt-1 text-3xl font-bold">Report a Civic Issue</h1>
        <p className="mt-2 text-slate-500">
          Submit a description and optional GPS location. The backend will classify,
          prioritize, and route the report automatically.
        </p>
      </div>

      {result && (
        <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-800">
          <div className="flex items-center gap-2 font-bold">
            <CheckCircle2 size={18} />
            Report submitted successfully
          </div>
          <p className="mt-2">
            Classified as <strong>{result.category}</strong>, priority{" "}
            <strong>{result.priority}</strong>, routed to{" "}
            <strong>{result.department}</strong>.
          </p>
        </div>
      )}

      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <label className="block">
          <span className="text-sm font-semibold">Issue title</span>
          <input
            required
            name="title"
            value={form.title}
            onChange={updateField}
            placeholder="e.g. Large pothole near main gate"
            className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-teal-500"
          />
        </label>

        <label className="block">
          <span className="text-sm font-semibold">Description</span>
          <textarea
            required
            name="description"
            value={form.description}
            onChange={updateField}
            rows={6}
            placeholder="Describe the issue, its location, and any urgency..."
            className="mt-2 w-full resize-none rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-teal-500"
          />
        </label>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-semibold">GPS location</span>
            <button
              type="button"
              onClick={getLocation}
              disabled={locationLoading}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold hover:bg-slate-200 disabled:opacity-50"
            >
              <MapPin size={14} />
              {locationLoading ? "Getting location..." : "Use my location"}
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <input
              type="number"
              step="any"
              name="latitude"
              value={form.latitude}
              onChange={updateField}
              placeholder="Latitude"
              className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-teal-500"
            />
            <input
              type="number"
              step="any"
              name="longitude"
              value={form.longitude}
              onChange={updateField}
              placeholder="Longitude"
              className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-teal-500"
            />
          </div>
        </div>

        <button
          disabled={submitting}
          className="w-full rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? "Submitting..." : "Submit Report"}
        </button>
      </form>
    </section>
  );
}
