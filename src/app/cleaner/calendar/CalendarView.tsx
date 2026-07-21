"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { localDateStr } from "@/lib/date";
import { CommunityGroup, groupByCommunity, type GroupedBooking } from "@/components/BookingGroups";
import { useT } from "@/lib/LanguageContext";
import { MONTHS, WEEKDAYS_SHORT } from "@/lib/i18n";

const STATUS_DOT: Record<string, string> = {
  scheduled: "bg-yellow-500",
  in_progress: "bg-blue-500",
  completed: "bg-green-500",
  cancelled: "bg-red-500",
};

function ordinal(n: number) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export default function CalendarView({ employeeId }: { employeeId: string }) {
  const { lang } = useT();
  const WEEKDAY_LABELS = WEEKDAYS_SHORT[lang];
  const MONTH_LABELS = MONTHS[lang];
  const today = useMemo(() => new Date(), []);
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(localDateStr(today));
  const [bookings, setBookings] = useState<GroupedBooking[]>([]);
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
      .gte("scheduled_date", localDateStr(monthStart))
      .lte("scheduled_date", localDateStr(monthEnd))
      .order("scheduled_time_slot")
      .then(({ data }) => {
        const flattened = (data ?? []).map((b: any) => ({ ...b, villa: b.car.villa }));
        setBookings(flattened as GroupedBooking[]);
        setLoading(false);
      });
  }, [employeeId, year, month]);

  const bookingsByDate = useMemo(() => {
    const map: Record<string, GroupedBooking[]> = {};
    for (const b of bookings) {
      const key = (b as any).scheduled_date;
      map[key] = map[key] ? [...map[key], b] : [b];
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

  const selectedBookings = bookingsByDate[selectedDate] ?? [];
  const byCommunity = useMemo(() => groupByCommunity(selectedBookings), [selectedBookings]);

  const d = new Date(`${selectedDate}T00:00:00`);
  const selectedLabel = lang === "en"
    ? `${WEEKDAY_LABELS[d.getDay()]}, ${ordinal(d.getDate())} ${MONTH_LABELS[d.getMonth()]}`
    : `${WEEKDAY_LABELS[d.getDay()]} ${d.getDate()} ${MONTH_LABELS[d.getMonth()]}`;

  return (
    <div className="space-y-4">
      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setViewDate(new Date(year, month - 1, 1))}
          className="min-h-11 min-w-11 rounded-lg border text-lg font-bold text-gray-600"
        >
          ‹
        </button>
        <h1 className="text-lg font-bold">{MONTH_LABELS[month]} {year}</h1>
        <button
          onClick={() => setViewDate(new Date(year, month + 1, 1))}
          className="min-h-11 min-w-11 rounded-lg border text-lg font-bold text-gray-600"
        >
          ›
        </button>
      </div>

      {/* Calendar grid */}
      <div className="rounded-card bg-white border border-line p-2">
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-gray-400 mb-1">
          {WEEKDAY_LABELS.map((d) => <div key={d}>{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((date, i) => {
            if (!date) return <div key={i} />;
            const dateStr = localDateStr(date);
            const dayBookings = bookingsByDate[dateStr] ?? [];
            const isSelected = dateStr === selectedDate;
            const isToday = dateStr === localDateStr(today);

            return (
              <button
                key={dateStr}
                onClick={() => setSelectedDate(dateStr)}
                className={`flex flex-col items-center justify-center rounded-lg py-1.5 min-h-11 text-sm ${
                  isSelected ? "bg-blue-600 text-white font-bold"
                  : isToday ? "bg-blue-50 text-blue-700 font-semibold"
                  : "text-gray-700"
                }`}
              >
                {date.getDate()}
                {dayBookings.length > 0 && (
                  <span className="flex gap-0.5 mt-0.5">
                    {dayBookings.slice(0, 3).map((b, idx) => (
                      <span key={idx} className={`h-1.5 w-1.5 rounded-full ${isSelected ? "bg-white" : STATUS_DOT[(b as any).status]}`} />
                    ))}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected day bookings */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 mb-3">{selectedLabel}</h2>
        {loading ? (
          <p className="text-center text-gray-400 py-6">Loading…</p>
        ) : selectedBookings.length === 0 ? (
          <p className="text-center text-gray-400 py-6">No jobs this day.</p>
        ) : (
          <div className="space-y-4">
            {Object.entries(byCommunity).map(([community, communityBookings]) => (
              <CommunityGroup key={community} name={community} bookings={communityBookings} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
