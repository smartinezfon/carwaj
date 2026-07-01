import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { to, message } = body as { to?: string; message?: string };

  if (!to || !message) {
    return NextResponse.json({ error: "to and message are required" }, { status: 400 });
  }

  const accessToken = process.env.META_WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.META_WHATSAPP_PHONE_NUMBER_ID;

  if (!accessToken || !phoneNumberId) {
    return NextResponse.json({ error: "Meta WhatsApp env vars not configured" }, { status: 500 });
  }

  const phone = to.replace(/[^\d+]/g, "").replace(/^\+/, "");

  const res = await fetch(
    `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: phone,
        type: "text",
        text: { body: message },
      }),
    }
  );

  const data = await res.json();
  if (!res.ok) {
    return NextResponse.json({ error: data }, { status: res.status });
  }

  return NextResponse.json(data);
}
