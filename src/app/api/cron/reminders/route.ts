import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendWhatsAppMessage } from "@/lib/twilio";

// Trigger this daily (e.g. via Vercel Cron or pg_cron) to send:
// 1. Day-before booking reminders
// 2. Payment due reminders
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().slice(0, 10);
  const todayStr = today.toISOString().slice(0, 10);

  const { data: bookings } = await supabase
    .from("bookings")
    .select("*, car:cars(*, villa:villas(*))")
    .eq("scheduled_date", tomorrowStr)
    .eq("status", "scheduled");

  let bookingReminders = 0;
  for (const booking of bookings ?? []) {
    const villa = (booking as any).car.villa;
    const carModel = `${(booking as any).car.make} ${(booking as any).car.model}`;
    try {
      await sendWhatsAppMessage({
        to: villa.owner_whatsapp,
        message: `Hi ${villa.owner_name}, your ${carModel} is scheduled for cleaning tomorrow between ${booking.scheduled_time_slot}. Reply CONFIRM to confirm.`,
      });
      bookingReminders += 1;
    } catch {
      // continue notifying remaining bookings even if one fails
    }
  }

  const { data: payments } = await supabase
    .from("payments")
    .select("*, villa:villas(*)")
    .eq("status", "pending")
    .eq("due_date", todayStr);

  let paymentReminders = 0;
  for (const payment of payments ?? []) {
    const villa = (payment as any).villa;
    try {
      await sendWhatsAppMessage({
        to: villa.owner_whatsapp,
        message: `Hi ${villa.owner_name}, your car cleaning payment of AED ${payment.amount} is due on ${payment.due_date}. Please transfer to our account or reply for assistance.`,
      });
      paymentReminders += 1;
    } catch {
      // continue notifying remaining payments even if one fails
    }
  }

  return NextResponse.json({ bookingReminders, paymentReminders });
}
