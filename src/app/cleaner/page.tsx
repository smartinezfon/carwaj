import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import BookingCard from "@/components/BookingCard";
import { localDateStr } from "@/lib/date";
import type { BookingWithDetails } from "@/lib/types";

type BookingFull = BookingWithDetails & {
  villa: BookingWithDetails["villa"] & { community: { name: string } | null };
};

function groupByCommunityVilla(bookings: BookingFull[]) {
  return bookings.reduce<Record<string, Record<string, BookingFull[]>>>((acc, b) => {
    const community = b.villa.community?.name ?? "Unassigned";
    const villa = b.villa.villa_number;
    acc[community] = acc[community] ?? {};
    acc[community][villa] = acc[community][villa] ? [...acc[community][villa], b] : [b];
    return acc;
  }, {});
}

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

  const list = (bookings ?? []).map((b: any) => ({ ...b, villa: b.car.villa })) as unknown as BookingFull[];

  const pending = list.filter((b) => b.status !== "completed");
  const completed = list.filter((b) => b.status === "completed");

  const pendingGroups = groupByCommunityVilla(pending);
  const completedGroups = groupByCommunityVilla(completed);

  return (
    <div className="space-y-4">
      <div className="rounded-card bg-white p-4 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">Today</p>
          <p className="text-2xl font-bold">
            <span className="text-green-600">{completed.length}</span>
            <span className="text-gray-300"> / </span>
            <span>{list.length}</span>
          </p>
        </div>
      </div>

      {list.length === 0 && (
        <p className="text-center text-gray-500 py-10">No jobs scheduled for today.</p>
      )}

      {/* Pending / in-progress jobs */}
      {Object.entries(pendingGroups).map(([communityName, byVilla]) => (
        <div key={communityName}>
          <h2 className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-2">
            {communityName}
          </h2>
          <div className="space-y-3">
            {Object.entries(byVilla).map(([villaNumber, villaBookings]) => (
              <div key={villaNumber}>
                <h3 className="text-sm font-semibold text-gray-600 mb-1.5">Villa {villaNumber}</h3>
                <div className="space-y-2">
                  {villaBookings.map((b) => (
                    <BookingCard key={b.id} booking={b} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Completed jobs — grouped at the bottom */}
      {completed.length > 0 && (
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-2">
            Completed ({completed.length})
          </h2>
          <div className="space-y-3">
            {Object.entries(completedGroups).map(([communityName, byVilla]) => (
              <div key={communityName}>
                {Object.keys(pendingGroups).length > 0 && (
                  <p className="text-xs text-gray-400 mb-1">{communityName}</p>
                )}
                {Object.entries(byVilla).map(([villaNumber, villaBookings]) => (
                  <div key={villaNumber} className="mb-3">
                    <h3 className="text-sm font-semibold text-gray-600 mb-1.5">Villa {villaNumber}</h3>
                    <div className="space-y-2">
                      {villaBookings.map((b) => (
                        <BookingCard key={b.id} booking={b} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
