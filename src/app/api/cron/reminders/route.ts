import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { notifyPaymentDue, notifyPaymentOverdue } from "@/lib/whatsapp";
import { localDateStr, startOfBusinessDay } from "@/lib/date";

// Run daily. Handles:
// 1. Payment due reminders: 3 days, 2 days, 1 day before due date
// 2. Overdue payment reminders: every day after due date until paid
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const today = startOfBusinessDay();

  // Dates to check for upcoming reminders (1, 2, 3 days from now)
  function addDays(date: Date, days: number) {
    const d = new Date(date.getTime());
    d.setDate(d.getDate() + days);
    return localDateStr(d);
  }

  const upcomingDates = [
    { dateStr: addDays(today, 1), daysUntilDue: 1 },
    { dateStr: addDays(today, 2), daysUntilDue: 2 },
    { dateStr: addDays(today, 3), daysUntilDue: 3 },
  ];

  const todayStr = localDateStr(today);

  // Fetch upcoming payments (due in 1-3 days)
  const { data: upcomingPayments } = await supabase
    .from("payments")
    .select("*, villa:villas(owner_name, owner_whatsapp)")
    .eq("status", "pending")
    .in("due_date", upcomingDates.map((d) => d.dateStr));

  let dueReminders = 0;
  for (const payment of upcomingPayments ?? []) {
    const villa = (payment as any).villa;
    if (!villa?.owner_whatsapp) continue;
    const match = upcomingDates.find((d) => d.dateStr === payment.due_date);
    if (!match) continue;
    try {
      await notifyPaymentDue({
        ownerPhone: villa.owner_whatsapp,
        ownerName: villa.owner_name,
        amount: payment.amount,
        dueDate: payment.due_date,
        daysUntilDue: match.daysUntilDue,
      });
      dueReminders++;
    } catch {
      // continue on individual failure
    }
  }

  // Fetch overdue payments (due date is before today, still pending)
  const { data: overduePayments } = await supabase
    .from("payments")
    .select("*, villa:villas(owner_name, owner_whatsapp)")
    .eq("status", "pending")
    .lt("due_date", todayStr);

  let overdueReminders = 0;
  for (const payment of overduePayments ?? []) {
    const villa = (payment as any).villa;
    if (!villa?.owner_whatsapp) continue;

    const dueMs = new Date(payment.due_date).getTime();
    const overdueDays = Math.floor((today.getTime() - dueMs) / (1000 * 60 * 60 * 24));

    try {
      await notifyPaymentOverdue({
        ownerPhone: villa.owner_whatsapp,
        ownerName: villa.owner_name,
        amount: payment.amount,
        dueDate: payment.due_date,
        overdueDays,
      });
      overdueReminders++;
    } catch {
      // continue on individual failure
    }
  }

  return NextResponse.json({ dueReminders, overdueReminders });
}
