import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { notifyCarCleaned } from "@/lib/whatsapp";
import type { BookingStatus } from "@/lib/types";

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { status, before_photo_url, after_photo_url, notes, employee_id, scheduled_date, scheduled_time_slot } =
    body as {
      status?: BookingStatus;
      before_photo_url?: string;
      after_photo_url?: string;
      notes?: string;
      employee_id?: string;
      scheduled_date?: string;
      scheduled_time_slot?: string;
    };

  const updates: Record<string, unknown> = {};
  if (status) updates.status = status;
  if (before_photo_url) updates.before_photo_url = before_photo_url;
  if (after_photo_url) updates.after_photo_url = after_photo_url;
  if (notes !== undefined) updates.notes = notes;
  if (employee_id !== undefined) updates.employee_id = employee_id;
  if (scheduled_date) updates.scheduled_date = scheduled_date;
  if (scheduled_time_slot) updates.scheduled_time_slot = scheduled_time_slot;
  if (status === "completed") updates.completed_at = new Date().toISOString();

  const { data: booking, error } = await supabase
    .from("bookings")
    .update(updates)
    .eq("id", params.id)
    .select("*, car:cars(*, villa:villas(*))")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (status === "completed") {
    const villa = booking.car.villa;
    const carLabel = `${booking.car.make} ${booking.car.model}`;
    console.log("[WhatsApp] Sending notification", {
      ownerPhone: villa?.owner_whatsapp,
      ownerName: villa?.owner_name,
      carLabel,
      afterPhotoUrl: booking.after_photo_url,
    });
    try {
      await notifyCarCleaned({
        ownerPhone: villa.owner_whatsapp,
        ownerName: villa.owner_name,
        carLabel,
        afterPhotoUrl: booking.after_photo_url,
      });
      console.log("[WhatsApp] Notification sent successfully");
    } catch (err) {
      console.error("[WhatsApp] Notification failed:", err);
    }
  }

  return NextResponse.json(booking);
}
