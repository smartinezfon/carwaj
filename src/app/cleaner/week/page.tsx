import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import BookingCard from "@/components/BookingCard";
import type { BookingWithDetails } from "@/lib/types";

export const dynamic = "force-dynamic";

function startOfWeek(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day + 6) % 7;
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export default async function WeekSchedulePage() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  const { data: employee } = await supabase
    .from("employees")
    .select("id")
    .eq("auth_user_id", session!.user.id)
    .single();

  const now = new Date();
  const weekStart = startOfWeek(now);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  const { data: bookings } = await supabase
    .from("bookings")
    .select("*, car:cars(*, villa:villas(*))")
    .eq("employee_id", employee?.id)
    .gte("scheduled_date", weekStart.toISOString().slice(0, 10))
    .lte("scheduled_date", weekEnd.toISOString().slice(0, 10))
    .order("scheduled_date")
    .order("scheduled_time_slot");

  const list = (bookings ?? []) as unknown as BookingWithDetails[];
  const completedCount = list.filter((b) => b.status === "completed").length;

  const grouped = list.reduce<Record<string, BookingWithDetails[]>>((acc, b) => {
    acc[b.scheduled_date] = acc[b.scheduled_date] ? [...acc[b.scheduled_date], b] : [b];
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-white p-4 shadow-sm flex justify-between">
        <div>
          <p className="text-sm text-gray-500">This week</p>
          <p className="text-2xl font-bold">{list.length} cars</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Completed</p>
          <p className="text-2xl font-bold text-green-600">{completedCount}</p>
        </div>
      </div>

      {Object.keys(grouped).length === 0 && (
        <p className="text-center text-gray-500 py-10">No bookings this week.</p>
      )}

      {Object.entries(grouped).map(([date, dayBookings]) => (
        <div key={date}>
          <h2 className="text-sm font-semibold text-gray-500 mb-2">
            {new Date(date).toLocaleDateString(undefined, {
              weekday: "long",
              month: "short",
              day: "numeric",
            })}
          </h2>
          <div className="space-y-2">
            {dayBookings.map((b) => (
              <BookingCard key={b.id} booking={b} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
