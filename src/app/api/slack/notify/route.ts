import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { slackCustomerAdded } from "@/lib/slack";

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ ok: false }, { status: 401 });

  const { event, payload } = await request.json() as {
    event: string;
    payload: Record<string, string>;
  };

  if (event === "customer_added") {
    await slackCustomerAdded({
      villaNumber: payload.villaNumber ?? "?",
      communityName: payload.communityName ?? "",
      ownerName: payload.ownerName ?? "Unknown",
    });
  }

  return NextResponse.json({ ok: true });
}
