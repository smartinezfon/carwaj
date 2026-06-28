import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AssignEmployeeSelect from "./AssignEmployeeSelect";

export const dynamic = "force-dynamic";

function startOfWeek(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day + 6) % 7;
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export default async function SchedulePage() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  const weekStart = startOfWeek(new Date());
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d.toISOString().slice(0, 10);
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
      <h1 className="text-2xl font-bold mb-6">Schedule (this week)</h1>
      <div className="grid grid-cols-7 gap-3">
        {days.map((day) => {
          const dayBookings = (bookings ?? []).filter((b) => b.scheduled_date === day);
          return (
            <div key={day} className="rounded-xl bg-white border shadow-sm p-3 min-h-[200px]">
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
