import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import CommunityCard from "./CommunityCard";

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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Communities</h1>
        <Link
          href="/admin/communities/new"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
        >
          + New Community
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {communities?.map((community: any) => (
          <CommunityCard
            key={community.id}
            community={community}
            villaCount={community.villas?.[0]?.count ?? 0}
          />
        ))}
      </div>
    </div>
  );
}
