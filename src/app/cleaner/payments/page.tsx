import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getEmployee } from "@/lib/getEmployee";
import PaymentsClient from "./PaymentsClient";

export default async function PaymentsPage() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  const employee = await getEmployee(session.user.id);
  const employeeId = employee?.id ?? "";

  const [{ data: pending }, { data: paid }] = await Promise.all([
    supabase
      .from("payments")
      .select("*, villa:villas(villa_number, owner_name, owner_whatsapp, community:communities(name))")
      .eq("employee_id", employeeId)
      .eq("status", "pending")
      .order("due_date", { ascending: true }),
    supabase
      .from("payments")
      .select("*, villa:villas(villa_number, owner_name, community:communities(name))")
      .eq("employee_id", employeeId)
      .eq("status", "paid")
      .order("paid_at", { ascending: false }),
  ]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const pendingWithOverdue = (pending ?? []).map((p: any) => {
    const due = new Date(`${p.due_date}T00:00:00`);
    const overdueDays = due < today ? Math.floor((today.getTime() - due.getTime()) / (86400000)) : 0;
    return { ...p, overdueDays };
  });

  pendingWithOverdue.sort((a, b) => {
    if (a.overdueDays > 0 && b.overdueDays > 0) return b.overdueDays - a.overdueDays;
    if (a.overdueDays > 0) return -1;
    if (b.overdueDays > 0) return 1;
    return a.due_date.localeCompare(b.due_date);
  });

  return <PaymentsClient pending={pendingWithOverdue} paid={paid ?? []} />;
}
