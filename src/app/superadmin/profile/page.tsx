import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SuperAdminProfileForm from "./SuperAdminProfileForm";
export default async function SuperAdminProfilePage() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  const { data: employee } = await supabase
    .from("employees")
    .select("id, name, whatsapp_number")
    .eq("auth_user_id", session.user.id)
    .single();

  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>
      <SuperAdminProfileForm
        name={employee?.name ?? ""}
        email={session.user.email ?? ""}
        whatsapp={employee?.whatsapp_number ?? ""}
      />
    </div>
  );
}
