import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function CommunitiesPage() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  const { data: communities } = await supabase
    .from("communities")
    .select("*, villas(count)")
    .order("name");

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Communities</h1>
      <div className="grid grid-cols-2 gap-4">
        {communities?.map((community: any) => (
          <div key={community.id} className="rounded-xl bg-white border shadow-sm p-5">
            <h2 className="text-lg font-bold">{community.name}</h2>
            <p className="text-sm text-gray-500 mt-1">{community.location_description}</p>
            <p className="text-sm text-gray-600 mt-2">
              {community.villas?.[0]?.count ?? 0} villas
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
