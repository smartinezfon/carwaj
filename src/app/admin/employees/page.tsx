import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function startOfWeek(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day + 6) % 7;
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export default async function EmployeesPage() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  const { data: employees } = await supabase.from("employees").select("*").order("name");

  const now = new Date();
  const weekStart = startOfWeek(now).toISOString().slice(0, 10);
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;

  const { data: bookings } = await supabase
    .from("bookings")
    .select("employee_id, status, scheduled_date, car:cars(villa_id)")
    .gte("scheduled_date", monthStart);

  const { data: subs } = await supabase
    .from("service_subscriptions")
    .select("villa_id, price_per_clean")
    .eq("active", true);
  const priceByVilla = new Map<string, number>();
  subs?.forEach((s) => priceByVilla.set(s.villa_id, Number(s.price_per_clean)));

  const { data: villas } = await supabase.from("villas").select("id, community_id");
  const communityByVilla = new Map<string, string>();
  villas?.forEach((v) => communityByVilla.set(v.id, v.community_id));

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Employees</h1>
      <div className="overflow-x-auto rounded-xl bg-white border shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-sm text-gray-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">WhatsApp</th>
              <th className="px-4 py-3">Cleaned this week</th>
              <th className="px-4 py-3">Cleaned this month</th>
              <th className="px-4 py-3">Book of business</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {employees?.map((emp) => {
              const empBookings = (bookings ?? []).filter((b: any) => b.employee_id === emp.id);
              const weekCount = empBookings.filter(
                (b: any) => b.status === "completed" && b.scheduled_date >= weekStart
              ).length;
              const monthCount = empBookings.filter((b: any) => b.status === "completed").length;
              const villaIds = new Set(
                villas
                  ?.filter((v) => emp.community_ids?.includes(v.community_id))
                  .map((v) => v.id)
              );
              const bookOfBusiness = Array.from(villaIds).reduce(
                (sum, vId) => sum + (priceByVilla.get(vId) ?? 0),
                0
              );

              return (
                <tr key={emp.id}>
                  <td className="px-4 py-3 font-medium">{emp.name}</td>
                  <td className="px-4 py-3 capitalize">{emp.role}</td>
                  <td className="px-4 py-3">{emp.whatsapp_number}</td>
                  <td className="px-4 py-3">{weekCount}</td>
                  <td className="px-4 py-3">{monthCount}</td>
                  <td className="px-4 py-3">AED {bookOfBusiness.toLocaleString()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
