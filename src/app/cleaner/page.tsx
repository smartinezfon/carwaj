import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { localDateStr } from "@/lib/date";
import TodayClient from "./TodayClient";

export default async function TodaySchedulePage() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  const { data: employee } = await supabase
    .from("employees")
    .select("id")
    .eq("auth_user_id", session.user.id)
    .single();

  const today = localDateStr();

  const { data: bookings } = await supabase
    .from("bookings")
    .select("*, car:cars(*, villa:villas(*, community:communities(name)))")
    .eq("employee_id", employee?.id)
    .eq("scheduled_date", today)
    .order("scheduled_time_slot");

  const list = (bookings ?? []).map((b: any) => ({
    ...b,
    villa: b.car.villa,
  }));

  return <TodayClient bookings={list} today={today} />;
}
