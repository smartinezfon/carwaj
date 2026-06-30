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
          <thead className="bg-gray-50 text-sm text-gray-500">
            <tr>
              <th className="px-4 py-3">Villa</th>
              <th className="px-4 py-3">Owner</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Due date</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Responsible</th>
              <th className="px-4 py-3">Paid via</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {(payments ?? []).map((p: any) => {
              const overdue = p.status === "pending" ? daysOverdue(p.due_date, today) : 0;
              const cleanerName = p.employee_id ? employeeNameById.get(p.employee_id) ?? "Unknown" : "Unassigned";

              return (
                <tr key={p.id}>
                  <td className="px-4 py-3">{p.villa?.villa_number}</td>
                  <td className="px-4 py-3">{p.villa?.owner_name}</td>
                  <td className="px-4 py-3">AED {p.amount}</td>
                  <td className="px-4 py-3">{p.due_date}</td>
                  <td className="px-4 py-3">
                    {p.status === "paid" ? (
                      <span className="text-green-700 font-medium">Paid</span>
                    ) : overdue > 0 ? (
                      <span className="text-red-600 font-medium">
                        {overdue} day{overdue === 1 ? "" : "s"} overdue
                      </span>
                    ) : (
                      <span className="text-yellow-700 font-medium">Upcoming</span>
                    )}
                  </td>
                  <td className="px-4 py-3">{cleanerName}</td>
                  <td className="px-4 py-3 capitalize">{p.payment_method ?? "—"}</td>
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
