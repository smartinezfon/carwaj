import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function getSuperAdminSession() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;
  const { data: requester } = await supabase
    .from("employees")
    .select("role")
    .eq("auth_user_id", session.user.id)
    .single();
  if (requester?.role !== "super_admin") return null;
  return session;
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSuperAdminSession();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { name, owner_name, owner_email, status, admin_id, admin_name, admin_email, admin_password } = await request.json();
  const admin = createAdminClient();

  const { error: companyError } = await admin
    .from("companies")
    .update({ name, owner_name: owner_name || null, owner_email: owner_email || null, ...(status ? { status } : {}) })
    .eq("id", params.id);
  if (companyError) return NextResponse.json({ error: companyError.message }, { status: 500 });

  if (admin_id && admin_name) {
    const { error: empError } = await admin.from("employees").update({ name: admin_name }).eq("id", admin_id);
    if (empError) return NextResponse.json({ error: empError.message }, { status: 500 });
  }

  if (admin_id && (admin_email || admin_password)) {
    const { data: emp } = await admin.from("employees").select("auth_user_id").eq("id", admin_id).single();
    if (emp?.auth_user_id) {
      const updates: { email?: string; password?: string } = {};
      if (admin_email) updates.email = admin_email;
      if (admin_password) updates.password = admin_password;
      const { error: authError } = await admin.auth.admin.updateUserById(emp.auth_user_id, updates);
      if (authError) return NextResponse.json({ error: authError.message }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSuperAdminSession();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const admin = createAdminClient();

  // Delete auth users for all employees in this company before deleting the company
  const { data: employees } = await admin
    .from("employees")
    .select("auth_user_id")
    .eq("company_id", params.id);

  for (const emp of employees ?? []) {
    if (emp.auth_user_id) {
      await admin.auth.admin.deleteUser(emp.auth_user_id);
    }
  }

  // Delete the company — cascades to employees, communities, villas, cars, bookings, payments, subscriptions
  const { error } = await admin.from("companies").delete().eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
