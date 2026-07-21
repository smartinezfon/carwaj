"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { generateUpcomingBookings } from "@/lib/generateBookings";
import { generateUpcomingPayments } from "@/lib/generatePayments";
import { localDateStr } from "@/lib/date";
import { useT } from "@/lib/LanguageContext";
import { WEEKDAYS_SHORT } from "@/lib/i18n";

export default function AddScheduleForm({
  villaId,
  carId,
  employeeId,
  villaPrice,
}: {
  villaId: string;
  carId: string;
  employeeId: string;
  villaPrice: number;
}) {
  const router = useRouter();
  const supabase = createClient();
  const { t, lang } = useT();
  const WEEKDAY_LABELS = WEEKDAYS_SHORT[lang];
  const [open, setOpen] = useState(false);
  const [weekdays, setWeekdays] = useState<number[]>([1, 3, 5]);
  const [startTime, setStartTime] = useState("07:00");
  const [endTime, setEndTime] = useState("09:00");
  const [firstPaymentDate, setFirstPaymentDate] = useState(localDateStr());
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function toggleDay(day: number) {
    setWeekdays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (weekdays.length === 0) {
      setError(t("schedule_pick_day_error"));
      return;
    }
    setBusy(true);
    setError(null);

    const { data: subscription, error: insertError } = await supabase
      .from("service_subscriptions")
      .insert({
        villa_id: villaId,
        car_id: carId,
        frequency: "weekly",
        weekdays,
        time_window_start: startTime,
        time_window_end: endTime,
        price_per_clean: villaPrice,
        active: true,
      })
      .select()
      .single();

    if (insertError || !subscription) {
      setError(insertError?.message ?? "Failed to create schedule");
      setBusy(false);
      return;
    }

    const bookings = generateUpcomingBookings({
      subscriptionId: subscription.id,
      carIds: [carId],
      employeeId,
      weekdays,
      timeWindowStart: startTime,
      timeWindowEnd: endTime,
    });

    if (bookings.length > 0) {
      const { error: bookingsError } = await supabase.from("bookings").insert(bookings);
      if (bookingsError) {
        setError(`Schedule saved, but jobs failed: ${bookingsError.message}`);
        setBusy(false);
        return;
      }
    }

    const payments = generateUpcomingPayments({
      villaId,
      employeeId,
      subscriptionId: subscription.id,
      amount: villaPrice,
      firstPaymentDate,
    });
    await supabase.from("payments").insert(payments);

    setBusy(false);
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-left text-sm text-blue-600 font-semibold py-1.5 min-h-11"
      >
        {t("schedule_add_btn")}
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-lg border bg-gray-50 p-3">
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
                weekdays.includes(day)
                  ? "bg-blue-600 text-white"
                  : "bg-white border text-gray-600"
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
        <p className="text-xs font-semibold text-gray-500 mb-1">{t("schedule_first_payment")}</p>
        <input
          required
          type="date"
          value={firstPaymentDate}
          onChange={(e) => setFirstPaymentDate(e.target.value)}
          className="w-full rounded border px-2 py-2.5 text-sm min-h-11"
        />
        <p className="text-xs text-gray-400 mt-1">Payments will repeat monthly from this date.</p>
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={busy}
          className="flex-1 rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white disabled:opacity-50 min-h-11"
        >
          {busy ? t("profile_saving") : t("schedule_save")}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-lg border px-4 py-2.5 text-sm font-medium text-gray-600 min-h-11"
        >
          {t("schedule_cancel")}
        </button>
      </div>
    </form>
  );
}
