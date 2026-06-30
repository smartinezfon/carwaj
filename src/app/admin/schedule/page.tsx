import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import AssignEmployeeSelect from "./AssignEmployeeSelect";
import { localDateStr, startOfBusinessWeek } from "@/lib/date";
export default async function SchedulePage() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  const weekStart = startOfBusinessWeek();
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart.getTime() + i * 24 * 60 * 60 * 1000);
    return localDateStr(d);
  });

  const { data: bookings } = await supabase
    .from("bookings")
    .select("*, car:cars(*, villa:villas(villa_number))")
    .gte("scheduled_date", days[0])
    .lte("scheduled_date", days[6])
    .order("scheduled_time_slot");

  const { data: employees } = await supabase
    .from("employees")
    .select("id, name")
    .eq("role", "cleaner")
    .order("name");

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Schedule (this week)</h1>
        <Link
          href="/admin/schedule/new"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
        >
          + New Job
        </Link>
      </div>
      <div className="grid grid-cols-7 gap-3">
        {days.map((day) => {
          const dayBookings = (bookings ?? []).filter((b) => b.scheduled_date === day);
          return (
            <div key={day} className="rounded-card bg-white border border-line p-3 min-h-[200px]">
              <p className="text-sm font-semibold text-gray-500 mb-2">
                {new Date(day).toLocaleDateString(undefined, { weekday: "short", day: "numeric" })}
              </p>
              <div className="space-y-2">
                {dayBookings.map((b: any) => (
                  <div key={b.id} className="rounded-lg border p-2 text-xs space-y-1">
                    <p className="font-semibold">Villa {b.car.villa.villa_number}</p>
                    <p className="text-gray-500">{b.scheduled_time_slot}</p>
                    <p className="capitalize text-gray-500">{b.status.replace("_", " ")}</p>
                    <AssignEmployeeSelect
                      bookingId={b.id}
                      currentEmployeeId={b.employee_id}
                      employees={employees ?? []}
                    />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
