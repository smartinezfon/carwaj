import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { notifyCarCleaned } from "@/lib/whatsapp";

// Debug endpoint — call with ?bookingId=<id> to test WhatsApp notification
// Returns the full error details instead of swallowing them
export async function GET(request: NextRequest) {
  const bookingId = request.nextUrl.searchParams.get("bookingId");
  if (!bookingId) {
    return NextResponse.json({ error: "bookingId query param required" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: booking, error } = await admin
    .from("bookings")
    .select("*, car:cars(*, villa:villas(*))")
    .eq("id", bookingId)
    .single();

  if (error || !booking) {
    return NextResponse.json({ error: error?.message ?? "Booking not found" }, { status: 404 });
  }

  const car = booking.car;
  const villa = car?.villa;

  if (!villa?.owner_whatsapp) {
    return NextResponse.json({
      status: "skipped",
      reason: "villa or owner_whatsapp missing",
      car: { id: car?.id, make: car?.make, model: car?.model },
      villa: villa ?? null,
    });
  }

  const carLabel = `${car.make} ${car.model}`;
  try {
    const result = await notifyCarCleaned({
      ownerPhone: villa.owner_whatsapp,
      ownerName: villa.owner_name,
      carLabel,
    });
    return NextResponse.json({ status: "sent", result, ownerPhone: villa.owner_whatsapp });
  } catch (err) {
    return NextResponse.json({
      status: "error",
      error: err instanceof Error ? err.message : String(err),
      ownerPhone: villa.owner_whatsapp,
      carLabel,
    }, { status: 500 });
  }
}
