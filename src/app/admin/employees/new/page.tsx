import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import NewEmployeeForm from "./NewEmployeeForm";

export const dynamic = "force-dynamic";

export default async function NewEmployeePage() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  const { data: communities } = await supabase.from("communities").select("id, name").order("name");

  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-bold mb-6">New Employee</h1>
      <NewEmployeeForm communities={communities ?? []} />
    </div>
  );
}
