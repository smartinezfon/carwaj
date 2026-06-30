import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { company_id } = await request.json();
  if (!company_id) return NextResponse.json({ error: "company_id required" }, { status: 400 });

  // Only transition pending → active, never override a manual suspended
  const admin = createAdminClient();
  await admin
    .from("companies")
    .update({ status: "active" })
    .eq("id", company_id)
    .eq("status", "pending");

  return NextResponse.json({ ok: true });
}
