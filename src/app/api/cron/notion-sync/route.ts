import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { syncCompanyToNotion } from "@/lib/notion";

// Runs on a schedule. Read-only against Supabase — pushes current state to Notion.
// Never writes back to Supabase, so it can't affect the app's own data.
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Guards against ever syncing dev/preview Supabase data into Notion —
  // this must only ever reflect production, regardless of how it's triggered.
  if (process.env.VERCEL_ENV !== "production") {
    return NextResponse.json({ skipped: true, reason: "not production" });
  }

  const supabase = createAdminClient();

  const { data: companies } = await supabase
    .from("companies")
    .select("id, name, status");

  const { data: communities } = await supabase
    .from("communities")
    .select("id, company_id");

  const { data: villas } = await supabase
    .from("villas")
    .select("community_id, status, monthly_price");

  const communityIdsByCompany = new Map<string, Set<string>>();
  for (const c of communities ?? []) {
    if (!communityIdsByCompany.has(c.company_id)) communityIdsByCompany.set(c.company_id, new Set());
    communityIdsByCompany.get(c.company_id)!.add(c.id);
  }

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const company of companies ?? []) {
    const communityIds = communityIdsByCompany.get(company.id) ?? new Set();
    const companyVillas = (villas ?? []).filter((v) => communityIds.has(v.community_id));

    const activeClients = companyVillas.filter((v) => v.status === "active").length;
    const pausedClients = companyVillas.filter((v) => v.status === "paused").length;
    const formerClients = companyVillas.filter((v) => v.status === "former").length;
    const mrr = companyVillas
      .filter((v) => v.status === "active")
      .reduce((sum, v) => sum + (v.monthly_price ?? 0), 0);

    const result = await syncCompanyToNotion({
      carwajId: company.id,
      name: company.name,
      status: company.status,
      mrr,
      communitiesCount: communityIds.size,
      villasCount: companyVillas.length,
      activeClients,
      pausedClients,
      formerClients,
    });

    if (result === "created") created++;
    else if (result === "updated") updated++;
    else skipped++;
  }

  return NextResponse.json({ companies: companies?.length ?? 0, created, updated, skipped });
}
