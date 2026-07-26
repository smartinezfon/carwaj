import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getEmployee } from "@/lib/getEmployee";
import { localDateStr, startOfBusinessWeek } from "@/lib/date";
import OverviewCards from "./OverviewCards";

// Every query below is scoped to the admin's own company by explicit id list
// rather than relying on RLS alone. RLS is still the real boundary; this is a
// second lock on the same door, because an admin dashboard that silently
// aggregates another tenant's figures is the worst kind of bug to find late.
export default async function AdminOverviewPage() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  const employee = await getEmployee(session.user.id);
  const companyId = employee?.company_id;

  const today = localDateStr();
  const weekStartDate = startOfBusinessWeek();
  const weekStart = localDateStr(weekStartDate);
  const weekEnd = localDateStr(new Date(weekStartDate.getTime() + 6 * 24 * 60 * 60 * 1000));

  // Calendar month around the business-timezone "today", derived from the date
  // string so no timezone can shift it across a month boundary.
  const [year, month] = today.split("-").map(Number);
  const pad = (n: number) => String(n).padStart(2, "0");
  const monthStart = `${year}-${pad(month)}-01`;
  const monthEnd = `${year}-${pad(month)}-${pad(new Date(Date.UTC(year, month, 0)).getUTCDate())}`;

  // ---- Scope: this company's communities -> villas -> cars ----
  const { data: communities } = await supabase
    .from("communities")
    .select("id, name")
    .eq("company_id", companyId ?? "");
  const communityIds = (communities ?? []).map((c) => c.id);
  const communityNameById = new Map((communities ?? []).map((c) => [c.id, c.name]));

  const { data: villas } = await supabase
    .from("villas")
    .select("id, villa_number, community_id")
    .in("community_id", communityIds.length ? communityIds : ["-"]);
  const villaIds = (villas ?? []).map((v) => v.id);
  const villaById = new Map((villas ?? []).map((v) => [v.id, v]));

  const { data: cars } = await supabase
    .from("cars")
    .select("id, villa_id")
    .in("villa_id", villaIds.length ? villaIds : ["-"]);
  const carIds = (cars ?? []).map((c) => c.id);
  const carVillaId = new Map((cars ?? []).map((c) => [c.id, c.villa_id]));

  const [
    { data: todayJobs },
    { data: weekJobs },
    { data: monthPayments },
    { data: activeSubs },
    { data: employees },
  ] = await Promise.all([
    supabase
      .from("bookings")
      .select("id, status")
      .eq("scheduled_date", today)
      .in("car_id", carIds.length ? carIds : ["-"]),
    supabase
      .from("bookings")
      .select("id, car_id")
      .gte("scheduled_date", weekStart)
      .lte("scheduled_date", weekEnd)
      .in("car_id", carIds.length ? carIds : ["-"]),
    supabase
      .from("payments")
      .select("amount, status, due_date, employee_id, villa_id")
      .gte("due_date", monthStart)
      .lte("due_date", monthEnd)
      .in("villa_id", villaIds.length ? villaIds : ["-"]),
    supabase
      .from("service_subscriptions")
      .select("id, price_per_clean, villa_id")
      .eq("active", true)
      .in("villa_id", villaIds.length ? villaIds : ["-"]),
    supabase.from("employees").select("id, name").eq("company_id", companyId ?? ""),
  ]);

  const jobsToday = todayJobs ?? [];
  const toWashToday = jobsToday.filter((j) => j.status === "scheduled" || j.status === "in_progress").length;
  const washedToday = jobsToday.filter((j) => j.status === "completed").length;

  const weekByCommunity: Record<string, number> = {};
  (weekJobs ?? []).forEach((j: any) => {
    const villa = villaById.get(carVillaId.get(j.car_id) ?? "");
    const name = (villa && communityNameById.get(villa.community_id)) ?? "Unassigned";
    weekByCommunity[name] = (weekByCommunity[name] ?? 0) + 1;
  });

  // ---- Revenue = what is DUE this month, from the payments table: the same
  // rows the cleaners see on their own Payments tab, so the two views agree by
  // construction rather than by coincidence. ----
  const employeeNameById = new Map((employees ?? []).map((e) => [e.id, e.name]));

  let revenueDueThisMonth = 0;
  let collectedThisMonth = 0;
  let outstandingThisMonth = 0;
  const revenueByCommunity: Record<string, number> = {};
  const revenueByVilla: Record<string, number> = {};
  const revenueByCleaner: Record<string, number> = {};

  (monthPayments ?? []).forEach((p: any) => {
    const amount = Number(p.amount);
    revenueDueThisMonth += amount;
    if (p.status === "paid") collectedThisMonth += amount;
    else outstandingThisMonth += amount;

    const villa = villaById.get(p.villa_id);
    const communityName = (villa && communityNameById.get(villa.community_id)) ?? "Unassigned";
    revenueByCommunity[communityName] = (revenueByCommunity[communityName] ?? 0) + amount;

    const villaLabel = villa ? `Villa ${villa.villa_number}` : "Unknown villa";
    revenueByVilla[villaLabel] = (revenueByVilla[villaLabel] ?? 0) + amount;

    const cleanerName = p.employee_id ? employeeNameById.get(p.employee_id) ?? "Unknown" : "Unassigned";
    revenueByCleaner[cleanerName] = (revenueByCleaner[cleanerName] ?? 0) + amount;
  });

  // A subscription with no price generates AED 0 payments, so an unnoticed
  // zero here quietly bills a real client nothing. Surface it, don't sum it.
  const unpricedVillas = (activeSubs ?? [])
    .filter((s: any) => !Number(s.price_per_clean))
    .map((s: any) => villaById.get(s.villa_id)?.villa_number)
    .filter((n: any): n is string => Boolean(n));

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Overview</h1>
      <OverviewCards
        jobsToday={jobsToday.length}
        toWashToday={toWashToday}
        washedToday={washedToday}
        jobsThisWeek={(weekJobs ?? []).length}
        weekByCommunity={weekByCommunity}
        revenueDueThisMonth={revenueDueThisMonth}
        collectedThisMonth={collectedThisMonth}
        outstandingThisMonth={outstandingThisMonth}
        revenueByCommunity={revenueByCommunity}
        revenueByVilla={revenueByVilla}
        revenueByCleaner={revenueByCleaner}
        unpricedVillas={[...new Set(unpricedVillas)]}
      />
    </div>
  );
}
