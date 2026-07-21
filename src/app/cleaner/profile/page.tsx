import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getEmployee } from "@/lib/getEmployee";
import ProfileForm from "./ProfileForm";
import ProfileSummary from "./ProfileSummary";

export default async function ProfilePage() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  const employee = await getEmployee(session.user.id);

  if (!employee) {
    return <p className="text-center text-gray-500 py-10">Profile not found.</p>;
  }

  const [{ data: communities }, { data: villas }, { data: payments }] = await Promise.all([
    supabase
      .from("communities")
      .select("id, name")
      .in("id", employee.community_ids ?? []),
    supabase
      .from("villas")
      .select("id, community_id, cars(id)")
      .in("community_id", employee.community_ids ?? []),
    supabase
      .from("payments")
      .select("villa_id, amount")
      .eq("status", "pending")
      .eq("employee_id", employee.id)
      .order("due_date", { ascending: false }),
  ]);

  // Use the first pending payment per villa as the monthly charge
  const revenueByVillaId = new Map<string, number>();
  for (const p of payments ?? []) {
    if (!revenueByVillaId.has(p.villa_id)) {
      revenueByVillaId.set(p.villa_id, Number(p.amount));
    }
  }

  const communitySummary = (communities ?? []).map((community) => {
    const communityVillas = (villas ?? []).filter((v: any) => v.community_id === community.id);
    const carCount = communityVillas.reduce((sum: number, v: any) => sum + (v.cars?.length ?? 0), 0);
    const monthlyRevenue = communityVillas.reduce(
      (sum: number, v: any) => sum + (revenueByVillaId.get(v.id) ?? 0),
      0
    );

    return {
      id: community.id,
      name: community.name,
      villaCount: communityVillas.length,
      carCount,
      monthlyRevenue,
    };
  });

  return (
    <div className="space-y-4">
      <ProfileForm employee={employee} />
      <ProfileSummary communities={communitySummary} />
    </div>
  );
}
