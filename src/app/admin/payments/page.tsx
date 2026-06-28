import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import MarkPaidButton from "./MarkPaidButton";

export const dynamic = "force-dynamic";

export default async function PaymentsPage() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  const { data: payments } = await supabase
    .from("payments")
    .select("*, villa:villas(villa_number, owner_name)")
    .order("due_date");

  const outstanding = payments?.filter((p) => p.status === "pending") ?? [];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Payments</h1>
      <p className="text-sm text-gray-500 mb-4">
        {outstanding.length} outstanding payment{outstanding.length === 1 ? "" : "s"}
      </p>
      <div className="overflow-x-auto rounded-xl bg-white border shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-sm text-gray-500">
            <tr>
              <th className="px-4 py-3">Villa</th>
              <th className="px-4 py-3">Owner</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Due date</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {payments?.map((p: any) => (
              <tr key={p.id}>
                <td className="px-4 py-3">{p.villa?.villa_number}</td>
                <td className="px-4 py-3">{p.villa?.owner_name}</td>
                <td className="px-4 py-3">AED {p.amount}</td>
                <td className="px-4 py-3">{p.due_date}</td>
                <td className="px-4 py-3 capitalize">{p.status}</td>
                <td className="px-4 py-3">
                  {p.status === "pending" && <MarkPaidButton paymentId={p.id} />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
