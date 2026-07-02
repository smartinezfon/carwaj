import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getEmployee } from "@/lib/getEmployee";
import CalendarView from "./CalendarView";

export default async function CalendarPage() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  const employee = await getEmployee(session.user.id);

  return <CalendarView employeeId={employee?.id ?? ""} />;
}
