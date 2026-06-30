import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import BookingCard from "@/components/BookingCard";
import { localDateStr } from "@/lib/date";
import type { BookingWithDetails } from "@/lib/types";
export default async function TodaySchedulePage() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  const { data: employee } = await supabase
    .from("employees")
    .select("id")
    .eq("auth_user_id", session!.user.id)
    .single();

  const today = localDateStr();

  const { data: bookings } = await supabase
    .from("bookings")
    .select("*, car:cars(*, villa:villas(*, community:communities(name)))")
    .eq("employee_id", employee?.id)
    .eq("scheduled_date", today)
    .order("scheduled_time_slot");

  const list = (bookings ?? []).map((b: any) => ({ ...b, villa: b.car.villa })) as unknown as (BookingWithDetails & {
    villa: BookingWithDetails["villa"] & { community: { name: string } | null };
  })[];
  const completedCount = list.filter((b) => b.status === "completed").length;

  const byCommunity = list.reduce<Record<string, typeof list>>((acc, b) => {
    const key = b.villa.community?.name ?? "Unassigned";
    acc[key] = acc[key] ? [...acc[key], b] : [b];
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <div className="rounded-card bg-white p-4 shadow-sm flex justify-between">
        <div>
          <p className="text-sm text-gray-500">Today</p>
          <p className="text-2xl font-bold">{list.length} cars</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Completed</p>
          <p className="text-2xl font-bold text-green-600">{completedCount}</p>
        </div>
      </div>

      {Object.keys(byCommunity).length === 0 && (
        <p className="text-center text-gray-500 py-10">No jobs scheduled for today.</p>
      )}

      {Object.entries(byCommunity).map(([communityName, communityBookings]) => {
        const byVilla = communityBookings.reduce<Record<string, typeof communityBookings>>(
          (acc, b) => {
            const key = b.villa.villa_number;
            acc[key] = acc[key] ? [...acc[key], b] : [b];
            return acc;
          },
          {}
        );

        return (
          <div key={communityName}>
            <h2 className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-2">
              {communityName}
            </h2>
            <div className="space-y-3">
              {Object.entries(byVilla).map(([villaNumber, villaBookings]) => (
                <div key={villaNumber}>
                  <h3 className="text-sm font-semibold text-gray-600 mb-1.5">
                    Villa {villaNumber}
                  </h3>
                  <div className="space-y-2">
                    {villaBookings.map((b) => (
                      <BookingCard key={b.id} booking={b} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
