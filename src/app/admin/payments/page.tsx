import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { localDateStr } from "@/lib/date";
function daysOverdue(dueDate: string, today: string): number {
  const due = new Date(`${dueDate}T00:00:00`);
  const now = new Date(`${today}T00:00:00`);
  return Math.round((now.getTime() - due.getTime()) / (24 * 60 * 60 * 1000));
}

export default async function PaymentsPage() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  const [{ data: payments }, { data: employees }] = await Promise.all([
    supabase
      .from("payments")
      .select("*, villa:villas(villa_number, owner_name)")
      .order("due_date"),
    supabase.from("employees").select("id, name"),
  ]);

  const employeeNameById = new Map((employees ?? []).map((e) => [e.id, e.name]));
  const today = localDateStr();

  const outstanding = (payments ?? []).filter((p) => p.status === "pending");
  const overdueCount = outstanding.filter((p) => daysOverdue(p.due_date, today) > 0).length;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Payments</h1>
      <p className="text-sm text-gray-500 mb-4">
        {outstanding.length} outstanding payment{outstanding.length === 1 ? "" : "s"}
        {overdueCount > 0 && (
          <span className="text-red-600 font-medium"> · {overdueCount} overdue</span>
        )}
        {" "}· managed by cleaners from their app, this is a read-only overview.
      </p>
      <div className="overflow-x-auto rounded-card bg-white border border-line">
        <table className="w-full text-left">
          <thead className="bg-[#fafbfc] border-b border-[#eef1f5] text-[11px] font-bold text-[#9aa3af] uppercase tracking-[0.03em]">
            <tr>
              <th className="px-4 py-3 text-left">Villa</th>
              <th className="px-4 py-3 text-left">Owner</th>
              <th className="px-4 py-3 text-right">Amount</th>
              <th className="px-4 py-3 text-left">Due date</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Responsible</th>
              <th className="px-4 py-3 text-left">Paid via</th>
            </tr>
          </thead>
          <tbody>
            {(payments ?? []).map((p: any) => {
              const overdue = p.status === "pending" ? daysOverdue(p.due_date, today) : 0;
              const cleanerName = p.employee_id ? employeeNameById.get(p.employee_id) ?? "Unknown" : "Unassigned";

              let statusEl: React.ReactNode;
              if (p.status === "paid") {
                statusEl = <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-[#e7f7ee] text-[#15803d]"><span className="w-1.5 h-1.5 rounded-full bg-[#16a34a]" />Paid</span>;
              } else if (overdue > 0) {
                statusEl = <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-[#fdecec] text-[#b91c1c]"><span className="w-1.5 h-1.5 rounded-full bg-[#ef4444]" />{overdue}d overdue</span>;
              } else {
                statusEl = <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-[#fff4e5] text-[#b45309]"><span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]" />Upcoming</span>;
              }

              return (
                <tr key={p.id} className="border-b border-[#f2f4f7] hover:bg-[#fafbfc] transition-colors">
                  <td className="px-4 py-3.5 font-bold text-[13.5px]">{p.villa?.villa_number}</td>
                  <td className="px-4 py-3.5 text-[#374151] text-[13.5px]">{p.villa?.owner_name}</td>
                  <td className="px-4 py-3.5 text-right font-bold font-mono tabular-nums text-[13.5px]">AED {p.amount}</td>
                  <td className="px-4 py-3.5 font-mono text-[12px] text-[#6b7280]">{p.due_date}</td>
                  <td className="px-4 py-3.5">{statusEl}</td>
                  <td className="px-4 py-3.5 text-[#6b7280] text-[13.5px]">{cleanerName}</td>
                  <td className="px-4 py-3.5 capitalize text-[#6b7280] text-[13.5px]">{p.payment_method ?? "—"}</td>
                </tr>
              );
            })}
            {(!payments || payments.length === 0) && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-gray-400">
                  No payments yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
