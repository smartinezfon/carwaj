import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function startOfWeek(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day + 6) % 7; // Monday as first day
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function GET() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const weekStart = startOfWeek(now).toISOString().slice(0, 10);
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;

  const [{ count: bookingsToday }, { count: bookingsThisWeek }, { data: monthBookings }] =
    await Promise.all([
      supabase
        .from("bookings")
        .select("*", { count: "exact", head: true })
        .eq("scheduled_date", today),
      supabase
        .from("bookings")
        .select("*", { count: "exact", head: true })
        .gte("scheduled_date", weekStart),
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

    revenueThisMonth = monthBookings.reduce((sum: number, b: any) => {
      return sum + (priceByVilla.get(b.car?.villa_id) ?? 0);
    }, 0);
  }

  return NextResponse.json({
    bookingsToday: bookingsToday ?? 0,
    bookingsThisWeek: bookingsThisWeek ?? 0,
    revenueThisMonth,
  });
}
