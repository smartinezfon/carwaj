import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { localDateStr, startOfBusinessWeek } from "@/lib/date";
import OverviewCards from "./OverviewCards";

export default async function AdminOverviewPage() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  const today = localDateStr();
  const weekStartDate = startOfBusinessWeek();
  const weekStart = localDateStr(weekStartDate);
  const weekEnd = localDateStr(new Date(weekStartDate.getTime() + 6 * 24 * 60 * 60 * 1000));

  const [
    { data: todayJobs },
    { data: weekJobs },
    { data: activeSubs },
    { data: employees },
    { data: subBookingLinks },
  ] = await Promise.all([
    supabase.from("bookings").select("id, status").eq("scheduled_date", today),
    supabase
      .from("bookings")
      .select("id, subscription_id, car:cars(villa:villas(community:communities(name)))")
      .gte("scheduled_date", weekStart)
      .lte("scheduled_date", weekEnd),
    supabase
      .from("service_subscriptions")
      .select("id, price_per_clean, villa:villas(community:communities(name))")
      .eq("active", true),
    supabase.from("employees").select("id, name"),
    supabase
      .from("bookings")
      .select("subscription_id, employee_id")
      .not("subscription_id", "is", null),
  ]);

  const jobsToday = todayJobs ?? [];
  const toWashToday = jobsToday.filter((j) => j.status === "scheduled" || j.status === "in_progress").length;
  const washedToday = jobsToday.filter((j) => j.status === "completed").length;

  const weekByCommunity: Record<string, number> = {};
  (weekJobs ?? []).forEach((j: any) => {
    const name = j.car?.villa?.community?.name ?? "Unassigned";
    weekByCommunity[name] = (weekByCommunity[name] ?? 0) + 1;
  });

  const employeeNameById = new Map((employees ?? []).map((e) => [e.id, e.name]));
  const employeeBySubscription = new Map<string, string>();
  (subBookingLinks ?? []).forEach((b: any) => {
    if (b.subscription_id && !employeeBySubscription.has(b.subscription_id)) {
      employeeBySubscription.set(b.subscription_id, b.employee_id);
    }
  });

  const revenueByCommunity: Record<string, number> = {};
  const revenueByCleaner: Record<string, number> = {};
  let revenueThisMonth = 0;

  (activeSubs ?? []).forEach((s: any) => {
    const price = Number(s.price_per_clean);
    revenueThisMonth += price;

    const communityName = s.villa?.community?.name ?? "Unassigned";
    revenueByCommunity[communityName] = (revenueByCommunity[communityName] ?? 0) + price;

    const employeeId = employeeBySubscription.get(s.id);
    const cleanerName = employeeId ? employeeNameById.get(employeeId) ?? "Unknown" : "Unassigned";
    revenueByCleaner[cleanerName] = (revenueByCleaner[cleanerName] ?? 0) + price;
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Overview</h1>
      <OverviewCards
        jobsToday={jobsToday.length}
        toWashToday={toWashToday}
        washedToday={washedToday}
        jobsThisWeek={(weekJobs ?? []).length}
        weekByCommunity={weekByCommunity}
        revenueThisMonth={revenueThisMonth}
        revenueByCommunity={revenueByCommunity}
        revenueByCleaner={revenueByCleaner}
      />
    </div>
  );
}
