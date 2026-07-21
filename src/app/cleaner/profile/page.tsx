import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getEmployee } from "@/lib/getEmployee";
import ProfileForm from "./ProfileForm";

export default async function ProfilePage() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  const employee = await getEmployee(session.user.id);

  if (!employee) {
    return <p className="text-center text-gray-500 py-10">Profile not found.</p>;
  }

  const [{ data: communities }, { data: villas }] = await Promise.all([
    supabase
      .from("communities")
      .select("id, name")
      .in("id", employee.community_ids ?? []),
    supabase
      .from("villas")
      .select("id, community_id, monthly_price, cars(id)")
      .in("community_id", employee.community_ids ?? []),
  ]);

  const communitySummary = (communities ?? []).map((community) => {
    const communityVillas = (villas ?? []).filter((v: any) => v.community_id === community.id);
    const carCount = communityVillas.reduce((sum: number, v: any) => sum + (v.cars?.length ?? 0), 0);
    const monthlyRevenue = communityVillas.reduce(
      (sum: number, v: any) => sum + Number(v.monthly_price ?? 0),
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
      <h1 className="text-xl font-bold">Profile</h1>
      <ProfileForm employee={employee} />

      <div>
        <h2 className="text-sm font-semibold text-gray-500 mb-2">My customers by community</h2>
        {communitySummary.length === 0 && (
          <p className="text-center text-gray-400 py-6">
            You're not assigned to any community yet.
          </p>
        )}
        <div className="space-y-2">
          {communitySummary.map((c) => (
            <div key={c.id} className="rounded-card bg-white border border-line p-4">
              <h3 className="font-bold">{c.name}</h3>
              <p className="text-sm text-gray-600 mt-1">
                {c.villaCount} villa{c.villaCount === 1 ? "" : "s"} · {c.carCount} car
                {c.carCount === 1 ? "" : "s"}
              </p>
              <p className="text-sm text-gray-500 mt-0.5">
                AED {c.monthlyRevenue.toLocaleString()}/mo
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
