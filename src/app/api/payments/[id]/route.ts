import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { notifyPaymentReceived } from "@/lib/whatsapp";
import { slackPaymentReceived } from "@/lib/slack";

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { status, payment_method, amount, due_date } = body as {
    status?: string;
    payment_method?: string;
    amount?: number;
    due_date?: string;
  };

  // Edit-only update (amount / due_date)
  if (amount !== undefined || due_date !== undefined) {
    const updates: Record<string, unknown> = {};
    if (amount !== undefined) updates.amount = amount;
    if (due_date !== undefined) updates.due_date = due_date;
    const { error } = await supabase.from("payments").update(updates).eq("id", params.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (status !== "paid" || !payment_method) {
    return NextResponse.json({ error: "status=paid and payment_method are required" }, { status: 400 });
  }

  const { data: payment, error } = await supabase
    .from("payments")
    .update({ status: "paid", payment_method, paid_at: new Date().toISOString() })
    .eq("id", params.id)
    .select("id, villa_id, employee_id, subscription_id, amount, due_date, villa:villas(owner_name, owner_whatsapp)")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Generate the next monthly payment if this came from a subscription
  if (payment.subscription_id) {
    const [y, m, d] = payment.due_date.split("-").map(Number);
    const next = new Date(y, m - 1 + 1, d); // same day, next month
    const pad = (n: number) => String(n).padStart(2, "0");
    const nextDue = `${next.getFullYear()}-${pad(next.getMonth() + 1)}-${pad(next.getDate())}`;
    await supabase.from("payments").insert({
      villa_id: payment.villa_id,
      employee_id: payment.employee_id,
      subscription_id: payment.subscription_id,
      amount: payment.amount,
      due_date: nextDue,
      status: "pending",
    });
  }

  const villa = (payment as any).villa;
  const methodLabel = payment_method === "cash" ? "cash" : "bank transfer";

  if (villa?.owner_whatsapp) {
    try {
      await notifyPaymentReceived({
        ownerPhone: villa.owner_whatsapp,
        ownerName: villa.owner_name,
        amount: payment.amount,
        method: methodLabel,
      });
    } catch {
      // notification failure should not block the payment update
    }
  }

  // Fetch community name for Slack
  let communityName = "";
  if (payment.villa_id) {
    const { data: v } = await supabase
      .from("villas")
      .select("villa_number, community:communities(name)")
      .eq("id", payment.villa_id)
      .single();
    const villaNumber = (v as any)?.villa_number ?? "?";
    communityName = (v as any)?.community?.name ?? "";
    await slackPaymentReceived({
      villaNumber,
      communityName,
      amount: payment.amount,
      method: methodLabel,
    });
  }

  return NextResponse.json(payment);
}
