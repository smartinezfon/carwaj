"use client";

import { useState } from "react";
import { CAR_CATALOG, CAR_MAKES } from "@/lib/carCatalog";

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface CarRow {
  make: string;
  model: string;
  customModel: string;
  color: string;
  plate_number: string;
}

function defaultCar(): CarRow {
  return { make: CAR_MAKES[0], model: CAR_CATALOG[CAR_MAKES[0]][0], customModel: "", color: "", plate_number: "" };
}

export default function OnboardingForm({ token }: { token: string }) {
  const [cars, setCars] = useState<CarRow[]>([defaultCar()]);
  const [weekdays, setWeekdays] = useState<number[]>([1, 3, 5]);
  const [startTime, setStartTime] = useState("07:00");
  const [endTime, setEndTime] = useState("09:00");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  function toggleDay(d: number) {
    setWeekdays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d].sort()));
  }

  function updateCar(i: number, field: keyof CarRow, value: string) {
    setCars((prev) => {
      const next = [...prev];
      if (field === "make") {
        next[i] = { ...next[i], make: value, model: CAR_CATALOG[value][0], customModel: "" };
      } else {
        next[i] = { ...next[i], [field]: value };
      }
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (weekdays.length === 0) {
      setError("Please select at least one cleaning day.");
      return;
    }
    setBusy(true);
    setError(null);

    const res = await fetch(`/api/onboarding/${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cars: cars.map((c) => ({
          make: c.make,
          model: c.model === "Other" ? c.customModel : c.model,
          color: c.color || null,
          plate_number: c.plate_number || null,
        })),
        weekdays,
        time_window_start: startTime,
        time_window_end: endTime,
        notes,
      }),
    });

    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError((data as any).error ?? "Something went wrong. Please try again.");
      return;
    }
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="text-center py-12 space-y-3">
        <div className="text-5xl">✅</div>
        <h2 className="text-lg font-bold">Details received!</h2>
        <p className="text-sm text-gray-500">Your cleaner will be in touch soon. You're all set.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      {/* Cars */}
      <div className="rounded-card bg-white border border-line p-4 space-y-4">
        <h2 className="text-sm font-semibold">Your Car(s)</h2>

        {cars.map((car, i) => (
          <div key={i} className="space-y-2 rounded-lg border border-line p-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-gray-500">
                {cars.length > 1 ? `Car ${i + 1}` : "Car details"}
              </p>
              {cars.length > 1 && (
                <button
                  type="button"
                  onClick={() => setCars((prev) => prev.filter((_, idx) => idx !== i))}
                  className="text-xs text-red-500 font-medium py-1"
                >
                  Remove
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <select
                value={car.make}
                onChange={(e) => updateCar(i, "make", e.target.value)}
                className="rounded-lg border px-2 py-2.5 text-sm min-h-11"
              >
                {CAR_MAKES.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <select
                value={car.model}
                onChange={(e) => updateCar(i, "model", e.target.value)}
                className="rounded-lg border px-2 py-2.5 text-sm min-h-11"
              >
                {CAR_CATALOG[car.make].map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            {car.model === "Other" && (
              <input
                required
                placeholder="Model name"
                value={car.customModel}
                onChange={(e) => updateCar(i, "customModel", e.target.value)}
                className="w-full rounded-lg border px-2 py-2.5 text-sm min-h-11"
              />
            )}

            <div className="grid grid-cols-2 gap-2">
              <input
                placeholder="Color (e.g. White)"
                value={car.color}
                onChange={(e) => updateCar(i, "color", e.target.value)}
                className="rounded-lg border px-2 py-2.5 text-sm min-h-11"
              />
              <input
                placeholder="Plate (e.g. A 12345)"
                value={car.plate_number}
                onChange={(e) => updateCar(i, "plate_number", e.target.value)}
                className="rounded-lg border px-2 py-2.5 text-sm min-h-11"
              />
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={() => setCars((prev) => [...prev, defaultCar()])}
          className="text-sm text-blue-600 font-semibold py-1 min-h-11"
        >
          + Add another car
        </button>
      </div>

      {/* Schedule */}
      <div className="rounded-card bg-white border border-line p-4 space-y-3">
        <h2 className="text-sm font-semibold">Preferred Cleaning Schedule</h2>

        <div>
          <p className="text-xs text-gray-500 mb-2">Which days?</p>
          <div className="flex gap-1.5 flex-wrap">
            {WEEKDAY_LABELS.map((label, d) => (
              <button
                key={d}
                type="button"
                onClick={() => toggleDay(d)}
                className={`min-h-11 min-w-11 rounded-full px-3 py-2 text-sm font-medium transition-colors ${
                  weekdays.includes(d) ? "bg-blue-600 text-white" : "bg-white border border-line text-gray-600"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs text-gray-500 mb-2">Preferred time window</p>
          <div className="flex items-center gap-2">
            <input
              required
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="rounded-lg border px-2 py-2.5 text-sm min-h-11"
            />
            <span className="text-sm text-gray-400">to</span>
            <input
              required
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="rounded-lg border px-2 py-2.5 text-sm min-h-11"
            />
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="rounded-card bg-white border border-line p-4">
        <h2 className="text-sm font-semibold mb-2">
          Notes <span className="text-gray-400 font-normal">(optional)</span>
        </h2>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any special instructions for your cleaner…"
          rows={3}
          className="w-full rounded-lg border px-3 py-2.5 text-sm"
        />
      </div>

      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-lg bg-blue-600 py-3.5 text-base font-semibold text-white disabled:opacity-50 min-h-11"
      >
        {busy ? "Submitting…" : "Submit My Details"}
      </button>

      <p className="text-center text-xs text-gray-400 pb-6">
        Your information is only shared with your cleaner.
      </p>
    </form>
  );
}
