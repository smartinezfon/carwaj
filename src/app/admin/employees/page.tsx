import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import EmployeeRow from "./EmployeeRow";
import { localDateStr, startOfBusinessWeek } from "@/lib/date";

export default async function EmployeesPage() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  const weekStart = localDateStr(startOfBusinessWeek());
  const monthStart = `${localDateStr().slice(0, 7)}-01`;

  const admin = createAdminClient();

  const [
    { data: employees },
    { data: communities },
    { data: authUsers },
    { data: bookings },
    { data: subs },
    { data: villas },
  ] = await Promise.all([
    supabase.from("employees").select("*").order("name"),
    supabase.from("communities").select("id, name").order("name"),
    admin.auth.admin.listUsers(),
    supabase
      .from("bookings")
      .select("employee_id, status, scheduled_date, car:cars(villa_id)")
      .gte("scheduled_date", monthStart),
    supabase.from("service_subscriptions").select("villa_id, price_per_clean").eq("active", true),
    supabase.from("villas").select("id, community_id"),
  ]);

  const emailByAuthUserId = new Map((authUsers?.users ?? []).map((u) => [u.id, u.email ?? ""]));
  const priceByVilla = new Map<string, number>();
  subs?.forEach((s) => priceByVilla.set(s.villa_id, Number(s.price_per_clean)));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Employees</h1>
        <Link
          href="/admin/employees/new"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
        >
          + New Employee
        </Link>
      </div>
      <div className="space-y-2">
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
            <EmployeeRow
              key={emp.id}
              employee={emp}
              email={emp.auth_user_id ? emailByAuthUserId.get(emp.auth_user_id) ?? "" : ""}
              communities={communities ?? []}
              weekCount={weekCount}
              monthCount={monthCount}
              bookOfBusiness={bookOfBusiness}
              isSelf={emp.auth_user_id === session.user.id}
            />
          );
        })}
        {(!employees || employees.length === 0) && (
          <p className="text-center text-gray-400 py-10">No employees yet.</p>
        )}
      </div>
    </div>
  );
}
