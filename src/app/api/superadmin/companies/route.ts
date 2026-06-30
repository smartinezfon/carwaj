import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: requester } = await supabase
    .from("employees")
    .select("role")
    .eq("auth_user_id", session.user.id)
    .single();
  if (requester?.role !== "super_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { name, owner_name, owner_email, admin_password } = await request.json();
  if (!name || !owner_email || !admin_password) {
    return NextResponse.json({ error: "name, owner_email and admin_password are required" }, { status: 400 });
  }

  const admin = createAdminClient();

  // 1. Create the company
  const { data: company, error: companyError } = await admin
    .from("companies")
    .insert({ name, owner_name: owner_name ?? null, owner_email })
    .select()
    .single();

  if (companyError || !company) {
    return NextResponse.json({ error: companyError?.message ?? "Failed to create company" }, { status: 500 });
  }

  // 2. Create the auth user for the company admin
  const { data: createdUser, error: userError } = await admin.auth.admin.createUser({
    email: owner_email,
    password: admin_password,
    email_confirm: true,
  });

  if (userError || !createdUser.user) {
    await admin.from("companies").delete().eq("id", company.id);
    return NextResponse.json({ error: userError?.message ?? "Failed to create user" }, { status: 500 });
  }

  // 3. Create the employee row as admin for this company
  const { error: empError } = await admin.from("employees").insert({
    auth_user_id: createdUser.user.id,
    name: owner_name ?? owner_email,
    role: "admin",
    company_id: company.id,
    community_ids: [],
    must_change_password: true,
  });

  if (empError) {
    await admin.auth.admin.deleteUser(createdUser.user.id);
    await admin.from("companies").delete().eq("id", company.id);
    return NextResponse.json({ error: empError.message }, { status: 500 });
  }

  return NextResponse.json(company, { status: 201 });
}
