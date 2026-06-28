import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import BookingCard from "@/components/BookingCard";
import type { BookingWithDetails } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function TodaySchedulePage() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  const { data: employee } = await supabase
    .from("employees")
    .select("id")
    .eq("auth_user_id", session!.user.id)
    .single();

  const today = new Date().toISOString().slice(0, 10);

  const { data: bookings } = await supabase
    .from("bookings")
    .select("*, car:cars(*, villa:villas(*))")
    .eq("employee_id", employee?.id)
    .eq("scheduled_date", today)
    .order("scheduled_time_slot");

  const list = (bookings ?? []) as unknown as BookingWithDetails[];
  const completedCount = list.filter((b) => b.status === "completed").length;

  const grouped = list.reduce<Record<string, BookingWithDetails[]>>((acc, b) => {
    const key = b.villa.villa_number;
    acc[key] = acc[key] ? [...acc[key], b] : [b];
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-white p-4 shadow-sm flex justify-between">
        <div>
          <p className="text-sm text-gray-500">Today</p>
          <p className="text-2xl font-bold">{list.length} cars</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Completed</p>
          <p className="text-2xl font-bold text-green-600">{completedCount}</p>
        </div>
      </div>

      {Object.keys(grouped).length === 0 && (
        <p className="text-center text-gray-500 py-10">No bookings scheduled for today.</p>
      )}

      {Object.entries(grouped).map(([villaNumber, villaBookings]) => (
        <div key={villaNumber}>
          <h2 className="text-sm font-semibold text-gray-500 mb-2">Villa {villaNumber}</h2>
          <div className="space-y-2">
            {villaBookings.map((b) => (
              <BookingCard key={b.id} booking={b} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
