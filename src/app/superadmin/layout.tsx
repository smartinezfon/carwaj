import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import SuperAdminSidebar from "@/components/SuperAdminSidebar";
export default async function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  const { data: employee } = await supabase
    .from("employees")
    .select("name")
    .eq("auth_user_id", session.user.id)
    .single();

  return (
    <div className="flex min-h-screen max-w-[1240px] mx-auto">
      <SuperAdminSidebar name={employee?.name ?? null} />
      <main className="flex-1 min-w-0 pt-[72px] px-4 pb-6 md:pt-6 md:pr-6 md:px-0">{children}</main>
    </div>
  );
}
