import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// The signed-in entry point. This used to live at "/", which is now the public
// landing page — anything that wants "send me wherever I belong" (the landing
// page's Sign in button, the PWA start_url) points here instead.
export const dynamic = "force-dynamic";

export default async function AppEntry() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) redirect("/login");

  const { data: employee } = await supabase
    .from("employees")
    .select("role, must_change_password")
    .eq("auth_user_id", session.user.id)
    .single();

  if (employee?.must_change_password) redirect("/set-password");

  if (employee?.role === "super_admin") redirect("/superadmin");
  if (employee?.role === "admin") redirect("/admin");
  redirect("/cleaner");
}
