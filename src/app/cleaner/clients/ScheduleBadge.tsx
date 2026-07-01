"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { generateUpcomingBookings } from "@/lib/generateBookings";
import { generateUpcomingPayments } from "@/lib/generatePayments";
import { localDateStr } from "@/lib/date";
import type { ServiceSubscription } from "@/lib/types";

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function ScheduleBadge({
  subscription,
  carId,
  employeeId,
}: {
  subscription: ServiceSubscription;
  carId: string;
  employeeId: string;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [editing, setEditing] = useState(false);
  const [weekdays, setWeekdays] = useState<number[]>(subscription.weekdays ?? []);
  const [startTime, setStartTime] = useState((subscription.time_window_start ?? "07:00").slice(0, 5));
  const [endTime, setEndTime] = useState((subscription.time_window_end ?? "09:00").slice(0, 5));
  const [pricePerClean, setPricePerClean] = useState(String(subscription.price_per_clean));
  const [nextPaymentDate, setNextPaymentDate] = useState(localDateStr());
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function toggleDay(day: number) {
    setWeekdays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    );
  }

  const today = localDateStr();

  async function regenerateFutureBookings() {
    await supabase
      .from("bookings")
      .delete()
      .eq("subscription_id", subscription.id)
      .eq("status", "scheduled")
      .gte("scheduled_date", today);

    const bookings = generateUpcomingBookings({
      subscriptionId: subscription.id,
      carIds: [carId],
      employeeId,
      weekdays,
      timeWindowStart: startTime,
      timeWindowEnd: endTime,
    });
    if (bookings.length > 0) {
      await supabase.from("bookings").insert(bookings);
    }
  }

  async function regenerateFuturePayments() {
    await supabase
      .from("payments")
      .delete()
      .eq("subscription_id", subscription.id)
      .eq("status", "pending")
      .gte("due_date", today);

    const payments = generateUpcomingPayments({
      villaId: subscription.villa_id,
      employeeId,
      subscriptionId: subscription.id,
      amount: Number(pricePerClean),
      firstPaymentDate: nextPaymentDate,
    });
    await supabase.from("payments").insert(payments);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (weekdays.length === 0) {
      setError("Pick at least one day");
      return;
    }
    setBusy(true);
    setError(null);

    const { error: updateError } = await supabase
      .from("service_subscriptions")
      .update({
        weekdays,
        time_window_start: startTime,
        time_window_end: endTime,
        price_per_clean: Number(pricePerClean),
      })
      .eq("id", subscription.id);

    if (updateError) {
      setError(updateError.message);
      setBusy(false);
      return;
    }

    await regenerateFutureBookings();
    await regenerateFuturePayments();

    setBusy(false);
    setEditing(false);
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm("Remove this schedule? Future unstarted jobs and pending payments from it will be cancelled.")) {
      return;
    }
    setBusy(true);
    await supabase
      .from("bookings")
      .delete()
      .eq("subscription_id", subscription.id)
      .eq("status", "scheduled")
      .gte("scheduled_date", today);
    await supabase
      .from("payments")
      .delete()
      .eq("subscription_id", subscription.id)
      .eq("status", "pending")
      .gte("due_date", today);
    await supabase.from("service_subscriptions").delete().eq("id", subscription.id);
    setBusy(false);
    router.refresh();
  }

  if (!editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1.5 text-xs font-medium text-green-700 min-h-11"
      >
        {subscription.weekdays?.map((d) => WEEKDAY_LABELS[d]).join("/")} ·{" "}
        {subscription.time_window_start?.slice(0, 5)}-{subscription.time_window_end?.slice(0, 5)} ·
        AED {subscription.price_per_clean}/mo
        <span className="text-green-500">✎</span>
      </button>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-3 rounded-lg border bg-gray-50 p-3">
      {error && <p className="rounded bg-red-50 px-2 py-1 text-xs text-red-700">{error}</p>}
      <div>
        <p className="text-xs font-semibold text-gray-500 mb-1">Cleaning days</p>
        <div className="flex flex-wrap gap-2">
          {WEEKDAY_LABELS.map((label, day) => (
            <button
              key={day}
              type="button"
              onClick={() => toggleDay(day)}
              className={`min-h-11 min-w-11 rounded-full px-3 py-2 text-sm font-medium ${
                weekdays.includes(day) ? "bg-blue-600 text-white" : "bg-white border text-gray-600"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-500 mb-1">Time window</p>
        <div className="flex items-center gap-2">
          <input
            required
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="rounded border px-2 py-2.5 text-sm min-h-11"
          />
          <span className="text-sm text-gray-400">to</span>
          <input
            required
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="rounded border px-2 py-2.5 text-sm min-h-11"
          />
        </div>
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-500 mb-1">Monthly price (AED)</p>
        <input
          required
          type="number"
          step="0.01"
          value={pricePerClean}
          onChange={(e) => setPricePerClean(e.target.value)}
          className="w-full rounded border px-2 py-2.5 text-sm min-h-11"
        />
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-500 mb-1">Next payment due date</p>
        <input
          required
          type="date"
          value={nextPaymentDate}
          onChange={(e) => setNextPaymentDate(e.target.value)}
          className="w-full rounded border px-2 py-2.5 text-sm min-h-11"
        />
        <p className="text-xs text-gray-400 mt-1">Replaces any pending payment for this schedule.</p>
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={busy}
          className="flex-1 rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white disabled:opacity-50 min-h-11"
        >
          {busy ? "Saving..." : "Save"}
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={busy}
          className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50 min-h-11"
        >
          Delete
        </button>
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="rounded-lg border px-4 py-2.5 text-sm font-medium text-gray-600 min-h-11"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
