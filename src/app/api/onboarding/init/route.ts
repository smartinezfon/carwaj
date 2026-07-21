import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { notifyClientOnboarding } from "@/lib/whatsapp";

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { token, ownerPhone, ownerName } = await request.json() as {
    token: string;
    ownerPhone: string;
    ownerName: string;
  };

  const origin = request.nextUrl.origin;
  const onboardingUrl = `${origin}/onboarding/${token}`;

  try {
    await notifyClientOnboarding({ ownerPhone, ownerName, onboardingUrl });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[Onboarding] WhatsApp send failed:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
