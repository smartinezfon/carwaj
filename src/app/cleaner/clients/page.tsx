import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getEmployee } from "@/lib/getEmployee";
import ClientCard from "./ClientCard";
import { localDateStr } from "@/lib/date";

export default async function ClientsPage() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  const employee = await getEmployee(session.user.id);

  const [{ data: villas }, { data: payments }, { data: completedBookings }] = await Promise.all([
    supabase
      .from("villas")
      .select("*, community:communities(name), cars(*), service_subscriptions(*, car_id), monthly_price")
      .in("community_id", employee?.community_ids ?? [])
      .order("villa_number"),
    supabase
      .from("payments")
      .select("*, villa:villas(villa_number, owner_name)")
      .eq("employee_id", employee?.id ?? "")
      .order("due_date", { ascending: false }),
    supabase
      .from("bookings")
      .select("id, scheduled_date, after_photo_url, car:cars(id, make, model, color, villa_id)")
      .eq("employee_id", employee?.id ?? "")
      .eq("status", "completed")
      .order("scheduled_date", { ascending: false })
      .limit(200),
  ]);

  const today = localDateStr();

  const paymentsByVilla = new Map<string, any[]>();
  (payments ?? []).forEach((p) => {
    const list = paymentsByVilla.get(p.villa_id) ?? [];
    list.push(p);
    paymentsByVilla.set(p.villa_id, list);
  });

  const historyByVilla = new Map<string, any[]>();
  (completedBookings ?? []).forEach((b: any) => {
    const villaId = b.car?.villa_id;
    if (!villaId) return;
    const list = historyByVilla.get(villaId) ?? [];
    list.push(b);
    historyByVilla.set(villaId, list);
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">My Clients</h1>
        <Link
          href="/cleaner/clients/new"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
        >
          + New Client
        </Link>
      </div>

      {(!villas || villas.length === 0) && (
        <p className="text-center text-gray-500 py-10">
          No clients yet. Add your first villa to get started.
        </p>
      )}

      <div className="space-y-3">
        {villas?.map((villa: any) => (
          <ClientCard
            key={villa.id}
            villa={villa}
            employeeId={employee?.id ?? ""}
            payments={paymentsByVilla.get(villa.id) ?? []}
            history={historyByVilla.get(villa.id) ?? []}
            today={today}
          />
        ))}
      </div>
    </div>
  );
}
