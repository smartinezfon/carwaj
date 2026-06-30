import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import NewBookingForm from "./NewBookingForm";
export default async function NewBookingPage() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  const { data: cars } = await supabase
    .from("cars")
    .select("id, make, model, color, plate_number, villa:villas(villa_number)")
    .order("make");

  const { data: employees } = await supabase
    .from("employees")
    .select("id, name")
    .eq("role", "cleaner")
    .order("name");

  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-bold mb-6">New Job</h1>
      <NewBookingForm cars={(cars ?? []) as any} employees={employees ?? []} />
    </div>
  );
}
