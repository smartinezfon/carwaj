import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CalendarView from "./CalendarView";
export default async function CalendarPage() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  const { data: employee } = await supabase
    .from("employees")
    .select("id")
    .eq("auth_user_id", session.user.id)
    .single();

  return <CalendarView employeeId={employee?.id ?? ""} />;
}
