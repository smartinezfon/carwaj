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

  const body = await request.json();
  const { name, whatsapp_number, role, new_password } = body as {
    name?: string;
    whatsapp_number?: string | null;
    role?: string;
    new_password?: string;
  };

  const admin = createAdminClient();

  const { data: target } = await admin
    .from("employees")
    .select("id, auth_user_id")
    .eq("id", params.id)
    .single();

  if (!target) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Update profile fields
  const updates: Record<string, unknown> = {};
  if (name !== undefined) updates.name = name;
  if (whatsapp_number !== undefined) updates.whatsapp_number = whatsapp_number || null;
  if (role !== undefined) updates.role = role;

  if (Object.keys(updates).length > 0) {
    const { error } = await admin.from("employees").update(updates).eq("id", params.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Change password
  if (new_password) {
    if (new_password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }
    if (!target.auth_user_id) {
      return NextResponse.json({ error: "Employee has no auth account" }, { status: 400 });
    }
    const { error: pwError } = await admin.auth.admin.updateUserById(target.auth_user_id, {
      password: new_password,
    });
    if (pwError) return NextResponse.json({ error: pwError.message }, { status: 500 });

    await admin.from("employees").update({ must_change_password: true }).eq("id", params.id);
  }

  return NextResponse.json({ ok: true });
}
