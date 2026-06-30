import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ClientCard from "./ClientCard";
import { localDateStr } from "@/lib/date";
export default async function ClientsPage() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  const { data: employee } = await supabase
    .from("employees")
    .select("id, community_ids")
    .eq("auth_user_id", session.user.id)
    .single();

  const { data: villas } = await supabase
    .from("villas")
    .select("*, community:communities(name), cars(*), service_subscriptions(*)")
    .in("community_id", employee?.community_ids ?? [])
    .order("villa_number");

  const { data: payments } = await supabase
    .from("payments")
    .select("*, villa:villas(villa_number, owner_name)")
    .eq("employee_id", employee?.id ?? "")
    .order("due_date", { ascending: false });

  const today = localDateStr();

  const paymentsByVilla = new Map<string, any[]>();
  (payments ?? []).forEach((p) => {
    const list = paymentsByVilla.get(p.villa_id) ?? [];
    list.push(p);
    paymentsByVilla.set(p.villa_id, list);
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
            today={today}
          />
        ))}
      </div>
    </div>
  );
}
