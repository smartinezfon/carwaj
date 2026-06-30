import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
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

  const { name, owner_name, owner_email, status, admin_id, admin_name, admin_email } = await request.json();
  const admin = createAdminClient();

  // Update company record
  const { error: companyError } = await admin
    .from("companies")
    .update({ name, owner_name: owner_name || null, owner_email: owner_email || null, ...(status ? { status } : {}) })
    .eq("id", params.id);

  if (companyError) {
    return NextResponse.json({ error: companyError.message }, { status: 500 });
  }

  // Update admin employee name
  if (admin_id && admin_name) {
    const { error: empError } = await admin
      .from("employees")
      .update({ name: admin_name })
      .eq("id", admin_id);

    if (empError) {
      return NextResponse.json({ error: empError.message }, { status: 500 });
    }
  }

  // Update admin login email via auth (requires looking up auth_user_id)
  if (admin_id && admin_email) {
    const { data: emp } = await admin
      .from("employees")
      .select("auth_user_id")
      .eq("id", admin_id)
      .single();

    if (emp?.auth_user_id) {
      const { error: authError } = await admin.auth.admin.updateUserById(emp.auth_user_id, {
        email: admin_email,
      });
      if (authError) {
        return NextResponse.json({ error: authError.message }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ ok: true });
}
