import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getEmployee } from "@/lib/getEmployee";
import ClientStatusGroups from "./ClientStatusGroups";
import ClientsHeader from "./ClientsHeader";
import { localDateStr } from "@/lib/date";

export default async function ClientsPage() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  const employee = await getEmployee(session.user.id);

  const [{ data: villas }, { data: payments }, { data: completedBookings }] = await Promise.all([
    supabase
      .from("villas")
      .select("*, community:communities(name), cars(*), service_subscriptions(*, car_id)")
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

  const STATUS_ORDER: Record<string, number> = { active: 0, paused: 1, former: 2 };

  const enrichedVillas = (villas ?? [])
    .map((villa: any) => ({
      villa,
      employeeId: employee?.id ?? "",
      payments: paymentsByVilla.get(villa.id) ?? [],
      history: historyByVilla.get(villa.id) ?? [],
      today,
    }))
    .sort((a, b) => {
      const statusA = STATUS_ORDER[a.villa.status ?? "active"] ?? 0;
      const statusB = STATUS_ORDER[b.villa.status ?? "active"] ?? 0;
      if (statusA !== statusB) return statusA - statusB;
      const commA = (a.villa.community?.name ?? "").toLowerCase();
      const commB = (b.villa.community?.name ?? "").toLowerCase();
      if (commA !== commB) return commA.localeCompare(commB);
      return (parseInt(a.villa.villa_number) || 0) - (parseInt(b.villa.villa_number) || 0);
    });

  return (
    <div className="space-y-4">
      <ClientsHeader isEmpty={enrichedVillas.length === 0} />
      <ClientStatusGroups villas={enrichedVillas} />
    </div>
  );
}
