import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function startOfWeek(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day + 6) % 7;
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export default async function AdminOverviewPage() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const weekStart = startOfWeek(now).toISOString().slice(0, 10);
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;

  const [{ count: bookingsToday }, { count: bookingsThisWeek }, { data: monthBookings }] =
    await Promise.all([
      supabase.from("bookings").select("*", { count: "exact", head: true }).eq("scheduled_date", today),
      supabase.from("bookings").select("*", { count: "exact", head: true }).gte("scheduled_date", weekStart),
      supabase
        .from("bookings")
        .select("id, car:cars(villa_id)")
        .eq("status", "completed")
        .gte("scheduled_date", monthStart),
    ]);

  let revenueThisMonth = 0;
  if (monthBookings && monthBookings.length > 0) {
    const villaIds = Array.from(
      new Set(monthBookings.map((b: any) => b.car?.villa_id).filter(Boolean))
    );
    const { data: subs } = await supabase
      .from("service_subscriptions")
      .select("villa_id, price_per_clean")
      .in("villa_id", villaIds);
    const priceByVilla = new Map<string, number>();
    subs?.forEach((s) => priceByVilla.set(s.villa_id, Number(s.price_per_clean)));
    revenueThisMonth = monthBookings.reduce(
      (sum: number, b: any) => sum + (priceByVilla.get(b.car?.villa_id) ?? 0),
      0
    );
  }

  const cards = [
    { label: "Bookings Today", value: bookingsToday ?? 0 },
    { label: "Bookings This Week", value: bookingsThisWeek ?? 0 },
    { label: "Revenue This Month", value: `AED ${revenueThisMonth.toLocaleString()}` },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Overview</h1>
      <div className="grid grid-cols-3 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl bg-white p-6 shadow-sm border">
            <p className="text-sm text-gray-500">{c.label}</p>
            <p className="text-3xl font-bold mt-2">{c.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
