import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
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
    // Fetch company and cleaner name server-side
    const admin = createAdminClient();
    let companyName = "";
    let cleanerName = "";
    let communityName = payload.communityName ?? "";

    const { data: emp } = await admin
      .from("employees")
      .select("name, company:companies(name)")
      .eq("auth_user_id", session.user.id)
      .single();
    if (emp?.name) cleanerName = emp.name;
    if ((emp as any)?.company?.name) companyName = (emp as any).company.name;

    // If communityName not passed, look it up
    if (!communityName && payload.communityId) {
      const { data: comm } = await admin
        .from("communities")
        .select("name")
        .eq("id", payload.communityId)
        .single();
      if (comm?.name) communityName = comm.name;
    }

    await slackCustomerAdded({
      companyName,
      cleanerName,
      communityName,
      villaNumber: payload.villaNumber ?? "?",
      ownerName: payload.ownerName ?? "Unknown",
    });
  }

  return NextResponse.json({ ok: true });
}
