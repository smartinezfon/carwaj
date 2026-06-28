import { NextRequest, NextResponse } from "next/server";
import { sendWhatsAppMessage } from "@/lib/twilio";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { to, message, mediaUrl } = body as { to?: string; message?: string; mediaUrl?: string };

  if (!to || !message) {
    return NextResponse.json({ error: "to and message are required" }, { status: 400 });
  }

  try {
    const result = await sendWhatsAppMessage({ to, message, mediaUrl });
    return NextResponse.json({ sid: result.sid, status: result.status });
  } catch (err) {
    const messageText = err instanceof Error ? err.message : "Failed to send WhatsApp message";
    return NextResponse.json({ error: messageText }, { status: 500 });
  }
}
