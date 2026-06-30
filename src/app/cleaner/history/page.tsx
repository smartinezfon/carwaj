import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
function timeliness(dueDate: string, paidAt: string): { label: string; days: number; tone: string } {
  const due = new Date(`${dueDate}T00:00:00`);
  const paidDateStr = new Date(paidAt).toISOString().slice(0, 10);
  const paid = new Date(`${paidDateStr}T00:00:00`);
  const days = Math.round((paid.getTime() - due.getTime()) / (24 * 60 * 60 * 1000));

  if (days < 0) return { label: `${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"} early`, days, tone: "bg-green-100 text-green-700" };
  if (days === 0) return { label: "On time", days, tone: "bg-blue-100 text-blue-700" };
  return { label: `${days} day${days === 1 ? "" : "s"} late`, days, tone: "bg-red-100 text-red-700" };
}

export default async function HistoryPage() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  const { data: employee } = await supabase
    .from("employees")
    .select("id")
    .eq("auth_user_id", session.user.id)
    .single();

  const { data: payments } = await supabase
    .from("payments")
    .select("*, villa:villas(villa_number, owner_name, community:communities(name))")
    .eq("employee_id", employee?.id ?? "")
    .eq("status", "paid")
    .order("paid_at", { ascending: false });

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Payment History</h1>
      <p className="text-sm text-gray-500">
        {payments?.length ?? 0} payment{(payments?.length ?? 0) === 1 ? "" : "s"} on record
      </p>

      {(!payments || payments.length === 0) && (
        <p className="text-center text-gray-400 py-10">No payments recorded yet.</p>
      )}

      <div className="space-y-2">
        {payments?.map((p: any) => {
          const { label, tone } = timeliness(p.due_date, p.paid_at);
          return (
            <div key={p.id} className="rounded-card bg-white border border-line p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-bold truncate">{p.villa?.owner_name}</h3>
                  <p className="text-sm text-gray-500 truncate">
                    Villa {p.villa?.villa_number} · {p.villa?.community?.name}
                  </p>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${tone}`}>
                  {label}
                </span>
              </div>
              <p className="text-sm text-gray-700 mt-2">
                Paid AED {p.amount} via {p.payment_method} on{" "}
                {new Date(p.paid_at).toLocaleDateString(undefined, {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">Due {p.due_date}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
