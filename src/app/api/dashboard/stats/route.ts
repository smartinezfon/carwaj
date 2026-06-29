import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { localDateStr, startOfBusinessWeek } from "@/lib/date";

export async function GET() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = localDateStr();
  const weekStartDate = startOfBusinessWeek();
  const weekStart = localDateStr(weekStartDate);
  const weekEnd = localDateStr(new Date(weekStartDate.getTime() + 6 * 24 * 60 * 60 * 1000));

  const [{ count: jobsToday }, { count: jobsThisWeek }, { data: activeSubs }] =
    await Promise.all([
      supabase
        .from("bookings")
        .select("*", { count: "exact", head: true })
        .eq("scheduled_date", today),
      supabase
        .from("bookings")
        .select("*", { count: "exact", head: true })
        .gte("scheduled_date", weekStart)
        .lte("scheduled_date", weekEnd),
      supabase.from("service_subscriptions").select("price_per_clean").eq("active", true),
    ]);

  const revenueThisMonth = (activeSubs ?? []).reduce(
    (sum, s) => sum + Number(s.price_per_clean),
    0
  );

  return NextResponse.json({
    jobsToday: jobsToday ?? 0,
    jobsThisWeek: jobsThisWeek ?? 0,
    revenueThisMonth,
  });
}
