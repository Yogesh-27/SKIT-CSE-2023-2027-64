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
    if (error) setError("");
    if (result) setResult(null);
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
        setError("Could not access your location. Check browser permissions or enter coordinates manually.");
        setLocationLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setResult(null);
    setError("");

    const title = form.title.trim();
    const description = form.description.trim();
    if (!title || !description) {
      setError("Please enter both an issue title and a description.");
      return;
    }
    if (title.length > 120) {
      setError("The issue title must be 120 characters or fewer.");
      return;
    }
    if (description.length > 2000) {
      setError("The description must be 2,000 characters or fewer.");
      return;
    }

    const hasLatitude = form.latitude.trim() !== "";
    const hasLongitude = form.longitude.trim() !== "";
    if (hasLatitude !== hasLongitude) {
      setError("Enter both latitude and longitude, or leave both fields empty.");
      return;
    }

    let latitude = null;
    let longitude = null;
    if (hasLatitude && hasLongitude) {
      latitude = Number(form.latitude);
      longitude = Number(form.longitude);
      if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
        setError("Latitude must be a number between -90 and 90.");
        return;
      }
      if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
        setError("Longitude must be a number between -180 and 180.");
        return;
      }
    }

    setSubmitting(true);
    try {
      const data = await createIssue({ title, description, latitude, longitude });
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
        <div role="status" className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-800">
          <div className="flex items-center gap-2 font-bold">
            <CheckCircle2 size={18} />
            Report submitted successfully
          </div>
          <p className="mt-2">
            Classified as <strong>{result.category?.replaceAll("_", " ")}</strong>, priority{" "}
            <strong>{result.priority}</strong>, routed to{" "}
            <strong>{result.department}</strong>.
          </p>
          {result._id && <p className="mt-1 text-xs">Reference ID: {result._id}</p>}
        </div>
      )}

      {error && (
        <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <label className="block">
          <span className="text-sm font-semibold">Issue title <span className="text-red-600">*</span></span>
          <input
            required
            maxLength={120}
            name="title"
            value={form.title}
            onChange={updateField}
            placeholder="e.g. Large pothole near main gate"
            aria-describedby="title-count"
            className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
          />
          <span id="title-count" className="mt-1 block text-right text-xs text-slate-400">{form.title.length}/120</span>
        </label>

        <label className="block">
          <span className="text-sm font-semibold">Description <span className="text-red-600">*</span></span>
          <textarea
            required
            maxLength={2000}
            name="description"
            value={form.description}
            onChange={updateField}
            rows={6}
            placeholder="Describe the issue, its location, and any urgency..."
            aria-describedby="description-count"
            className="mt-2 w-full resize-y rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
          />
          <span id="description-count" className="mt-1 block text-right text-xs text-slate-400">{form.description.length}/2000 characters</span>
        </label>

        <div>
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-sm font-semibold">GPS location</span>
              <p className="mt-0.5 text-xs text-slate-500">Optional, but it helps authorities find the issue.</p>
            </div>
            <button
              type="button"
              onClick={getLocation}
              disabled={locationLoading || submitting}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold hover:bg-slate-200 disabled:opacity-50"
            >
              <MapPin size={14} />
              {locationLoading ? "Getting location..." : "Use my location"}
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="sr-only">Latitude</span>
              <input
                type="number"
                min="-90"
                max="90"
                step="any"
                name="latitude"
                value={form.latitude}
                onChange={updateField}
                placeholder="Latitude (−90 to 90)"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              />
            </label>
            <label className="block">
              <span className="sr-only">Longitude</span>
              <input
                type="number"
                min="-180"
                max="180"
                step="any"
                name="longitude"
                value={form.longitude}
                onChange={updateField}
                placeholder="Longitude (−180 to 180)"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              />
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting || locationLoading}
          className="w-full rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? "Submitting report..." : "Submit Report"}
        </button>
        <p className="text-center text-xs text-slate-400">Fields marked with * are required.</p>
      </form>
    </section>
  );
}
