import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  const { data: employee } = await supabase
    .from("employees")
    .select("role")
    .eq("auth_user_id", session.user.id)
    .single();

  redirect(employee?.role === "admin" ? "/admin" : "/cleaner");
}
