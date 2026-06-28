import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { car_id, employee_id, scheduled_date, scheduled_time_slot, notes } = body as {
    car_id?: string;
    employee_id?: string;
    scheduled_date?: string;
    scheduled_time_slot?: string;
    notes?: string;
  };

  if (!car_id || !scheduled_date || !scheduled_time_slot) {
    return NextResponse.json(
      { error: "car_id, scheduled_date and scheduled_time_slot are required" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("bookings")
    .insert({
      car_id,
      employee_id: employee_id ?? null,
      scheduled_date,
      scheduled_time_slot,
      notes: notes ?? null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
