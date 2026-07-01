import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PaymentsClient from "./PaymentsClient";

export default async function PaymentsPage() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  const { data: employee } = await supabase
    .from("employees")
    .select("id")
    .eq("auth_user_id", session.user.id)
    .single();

  const { data: pending } = await supabase
    .from("payments")
    .select("*, villa:villas(villa_number, owner_name, owner_whatsapp, community:communities(name))")
    .eq("employee_id", employee?.id ?? "")
    .eq("status", "pending")
    .order("due_date", { ascending: true });

  const { data: paid } = await supabase
    .from("payments")
    .select("*, villa:villas(villa_number, owner_name, community:communities(name))")
    .eq("employee_id", employee?.id ?? "")
    .eq("status", "paid")
    .order("paid_at", { ascending: false });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const pendingWithOverdue = (pending ?? []).map((p: any) => {
    const due = new Date(`${p.due_date}T00:00:00`);
    const overdueDays = due < today ? Math.floor((today.getTime() - due.getTime()) / (86400000)) : 0;
    return { ...p, overdueDays };
  });

  // Sort: overdue first (most overdue at top), then upcoming
  pendingWithOverdue.sort((a, b) => {
    if (a.overdueDays > 0 && b.overdueDays > 0) return b.overdueDays - a.overdueDays;
    if (a.overdueDays > 0) return -1;
    if (b.overdueDays > 0) return 1;
    return a.due_date.localeCompare(b.due_date);
  });

  return <PaymentsClient pending={pendingWithOverdue} paid={paid ?? []} />;
}
