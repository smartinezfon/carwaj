import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateUpcomingBookings } from "@/lib/generateBookings";

export async function POST(request: NextRequest, { params }: { params: { token: string } }) {
  const supabase = createAdminClient();

  const { data: villa } = await supabase
    .from("villas")
    .select("id, monthly_price, community_id, onboarding_expires_at, onboarding_submitted_at")
    .eq("onboarding_token", params.token)
    .single();

  if (!villa) return NextResponse.json({ error: "Invalid link" }, { status: 404 });

  if (!villa.onboarding_expires_at || new Date(villa.onboarding_expires_at) < new Date()) {
    return NextResponse.json({ error: "Link has expired" }, { status: 410 });
  }

  if (villa.onboarding_submitted_at) {
    return NextResponse.json({ error: "Already submitted" }, { status: 409 });
  }

  const body = await request.json() as {
    cars: { make: string; model: string; color: string | null; plate_number: string | null }[];
    weekdays: number[];
    time_window_start: string;
    time_window_end: string;
    notes: string;
  };

  const { cars, weekdays, time_window_start, time_window_end, notes } = body;

  if (!cars.length || !weekdays.length) {
    return NextResponse.json({ error: "Cars and schedule are required" }, { status: 400 });
  }

  // Find the cleaner assigned to this community
  const { data: employee } = await supabase
    .from("employees")
    .select("id")
    .contains("community_ids", [villa.community_id])
    .eq("role", "cleaner")
    .limit(1)
    .single();

  // Insert cars
  const { data: createdCars, error: carsError } = await supabase
    .from("cars")
    .insert(cars.map((c) => ({ ...c, villa_id: villa.id })))
    .select("id");

  if (carsError || !createdCars) {
    return NextResponse.json({ error: carsError?.message ?? "Failed to create cars" }, { status: 500 });
  }

  // Create one subscription per car — no payments yet (triggered by first completed booking)
  const { data: subscriptions, error: subsError } = await supabase
    .from("service_subscriptions")
    .insert(
      createdCars.map((car) => ({
        villa_id: villa.id,
        car_id: car.id,
        frequency: "weekly",
        weekdays,
        time_window_start,
        time_window_end,
        price_per_clean: villa.monthly_price ?? 0,
        active: true,
      }))
    )
    .select("id");

  if (subsError || !subscriptions) {
    return NextResponse.json({ error: subsError?.message ?? "Failed to create schedules" }, { status: 500 });
  }

  // Generate upcoming bookings if we know the cleaner
  if (employee) {
    const bookings = subscriptions.flatMap((sub, i) =>
      generateUpcomingBookings({
        subscriptionId: sub.id,
        carIds: [createdCars[i].id],
        employeeId: employee.id,
        weekdays,
        timeWindowStart: time_window_start,
        timeWindowEnd: time_window_end,
      })
    );
    if (bookings.length > 0) {
      await supabase.from("bookings").insert(bookings);
    }
  }

  // Mark submitted and save notes
  await supabase
    .from("villas")
    .update({ onboarding_submitted_at: new Date().toISOString(), notes: notes || null })
    .eq("id", villa.id);

  return NextResponse.json({ ok: true });
}
