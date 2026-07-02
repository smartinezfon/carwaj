import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { slackCleanerAdded } from "@/lib/slack";

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: requester } = await supabase
    .from("employees")
    .select("role, company_id")
    .eq("auth_user_id", session.user.id)
    .single();
  if (requester?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { email, password, name, whatsapp_number, role, community_ids } = body as {
    email?: string;
    password?: string;
    name?: string;
    whatsapp_number?: string;
    role?: "cleaner" | "admin";
    community_ids?: string[];
  };

  if (!email || !password || !name || !role) {
    return NextResponse.json(
      { error: "email, password, name and role are required" },
      { status: 400 }
    );
  }

  const admin = createAdminClient();
  const { data: createdUser, error: createUserError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (createUserError || !createdUser.user) {
    return NextResponse.json(
      { error: createUserError?.message ?? "Failed to create user" },
      { status: 500 }
    );
  }

  const { data: employee, error: insertError } = await admin
    .from("employees")
    .insert({
      auth_user_id: createdUser.user.id,
      name,
      whatsapp_number: whatsapp_number ?? null,
      role,
      company_id: requester.company_id,
      community_ids: community_ids ?? [],
    })
    .select()
    .single();

  if (insertError) {
    await admin.auth.admin.deleteUser(createdUser.user.id);
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  await slackCleanerAdded({ name, role });
  return NextResponse.json(employee, { status: 201 });
}
