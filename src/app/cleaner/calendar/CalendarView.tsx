"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import StatusBadge from "@/components/StatusBadge";
import { localDateStr } from "@/lib/date";
import type { BookingWithDetails } from "@/lib/types";

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_LABELS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const STATUS_DOT: Record<string, string> = {
  scheduled: "bg-yellow-500",
  in_progress: "bg-blue-500",
  completed: "bg-green-500",
  cancelled: "bg-red-500",
};

const toDateStr = localDateStr;

export default function CalendarView({ employeeId }: { employeeId: string }) {
  const today = useMemo(() => new Date(), []);
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(toDateStr(today));
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  useEffect(() => {
    if (!employeeId) return;
    setLoading(true);
    const supabase = createClient();
    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 0);

    supabase
      .from("bookings")
      .select("*, car:cars(*, villa:villas(*, community:communities(name)))")
      .eq("employee_id", employeeId)
      .gte("scheduled_date", toDateStr(monthStart))
      .lte("scheduled_date", toDateStr(monthEnd))
      .order("scheduled_time_slot")
      .then(({ data }) => {
        const flattened = (data ?? []).map((b: any) => ({ ...b, villa: b.car.villa }));
        setBookings(flattened as unknown as BookingWithDetails[]);
        setLoading(false);
      });
  }, [employeeId, year, month]);

  const bookingsByDate = useMemo(() => {
    const map: Record<string, BookingWithDetails[]> = {};
    for (const b of bookings) {
      map[b.scheduled_date] = map[b.scheduled_date] ? [...map[b.scheduled_date], b] : [b];
    }
    return map;
  }, [bookings]);

  const firstDayOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leadingBlanks = firstDayOfMonth.getDay();

  const cells: (Date | null)[] = [
    ...Array.from({ length: leadingBlanks }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1)),
  ];

  function goToMonth(offset: number) {
    setViewDate(new Date(year, month + offset, 1));
  }

  const selectedBookings = bookingsByDate[selectedDate] ?? [];

  const selectedByCommunity = useMemo(() => {
    const map: Record<string, Record<string, BookingWithDetails[]>> = {};
    for (const b of selectedBookings) {
      const communityName = (b.villa as any).community?.name ?? "Unassigned";
      const villaKey = b.villa.villa_number;
      map[communityName] = map[communityName] ?? {};
      map[communityName][villaKey] = map[communityName][villaKey]
        ? [...map[communityName][villaKey], b]
        : [b];
    }
    return map;
  }, [selectedBookings]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button
          onClick={() => goToMonth(-1)}
          className="min-h-11 min-w-11 rounded-lg border text-lg font-bold text-gray-600"
        >
          ‹
        </button>
        <h1 className="text-lg font-bold">
          {MONTH_LABELS[month]} {year}
        </h1>
        <button
          onClick={() => goToMonth(1)}
          className="min-h-11 min-w-11 rounded-lg border text-lg font-bold text-gray-600"
        >
          ›
        </button>
      </div>

      <div className="rounded-card bg-white border border-line p-2">
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-gray-400 mb-1">
          {WEEKDAY_LABELS.map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((date, i) => {
            if (!date) return <div key={i} />;
            const dateStr = toDateStr(date);
            const dayBookings = bookingsByDate[dateStr] ?? [];
            const isSelected = dateStr === selectedDate;
            const isToday = dateStr === toDateStr(today);

            return (
              <button
                key={dateStr}
                onClick={() => setSelectedDate(dateStr)}
                className={`flex flex-col items-center justify-center rounded-lg py-1.5 min-h-11 text-sm ${
                  isSelected
                    ? "bg-blue-600 text-white font-bold"
                    : isToday
                    ? "bg-blue-50 text-blue-700 font-semibold"
                    : "text-gray-700"
                }`}
              >
                {date.getDate()}
                {dayBookings.length > 0 && (
                  <span className="flex gap-0.5 mt-0.5">
                    {dayBookings.slice(0, 3).map((b, idx) => (
                      <span
                        key={idx}
                        className={`h-1.5 w-1.5 rounded-full ${
                          isSelected ? "bg-white" : STATUS_DOT[b.status]
                        }`}
                      />
                    ))}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-gray-500 mb-2">
          {new Date(selectedDate).toLocaleDateString(undefined, {
            weekday: "long",
            month: "short",
            day: "numeric",
          })}
        </h2>
        {loading ? (
          <p className="text-center text-gray-400 py-6">Loading...</p>
        ) : selectedBookings.length === 0 ? (
          <p className="text-center text-gray-400 py-6">No jobs this day.</p>
        ) : (
          <div className="space-y-4">
            {Object.entries(selectedByCommunity).map(([communityName, byVilla]) => (
              <div key={communityName}>
                <h3 className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-2">
                  {communityName}
                </h3>
                <div className="space-y-3">
                  {Object.entries(byVilla).map(([villaNumber, villaBookings]) => (
                    <div key={villaNumber}>
                      <h4 className="text-sm font-semibold text-gray-600 mb-1.5">
                        Villa {villaNumber}
                      </h4>
                      <div className="space-y-2">
                        {villaBookings.map((b) => (
                          <Link
                            key={b.id}
                            href={`/cleaner/booking/${b.id}`}
                            className="block rounded-xl border bg-white p-4 shadow-sm active:scale-[0.99] transition"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-base font-bold">
                                {b.car.color} {b.car.make} {b.car.model}
                              </span>
                              <StatusBadge status={b.status} />
                            </div>
                            <p className="mt-1 text-sm text-gray-500">{b.scheduled_time_slot}</p>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
