import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import NewClientForm from "./NewClientForm";
export default async function NewClientPage() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  const { data: employee } = await supabase
    .from("employees")
    .select("community_ids")
    .eq("auth_user_id", session.user.id)
    .single();

  const { data: communities } = await supabase
    .from("communities")
    .select("id, name")
    .in("id", employee?.community_ids ?? [])
    .order("name");

  return (
    <div className="space-y-4">
      <NewClientForm communities={communities ?? []} />
    </div>
  );
}
