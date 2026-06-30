import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function SuperAdminDashboard() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  const [
    { data: companies },
    { data: employees },
    { data: villas },
    { data: cars },
    { data: payments },
    { data: communities },
  ] = await Promise.all([
    supabase.from("companies").select("id, name, active, created_at").order("created_at"),
    supabase.from("employees").select("id, name, role, company_id").neq("role", "super_admin"),
    supabase.from("villas").select("id, community_id, communities(company_id)"),
    supabase.from("cars").select("id, villa_id"),
    supabase.from("payments").select("id, amount, status, villa_id, communities:villas(community:communities(company_id))"),
    supabase.from("communities").select("id, name, company_id"),
  ]);

  const totalCompanies = companies?.length ?? 0;
  const totalCleaners = (employees ?? []).filter((e) => e.role === "cleaner").length;
  const totalAdmins = (employees ?? []).filter((e) => e.role === "admin").length;
  const totalVillas = villas?.length ?? 0;
  const totalCars = cars?.length ?? 0;

  const totalRevenue = (payments ?? [])
    .filter((p: any) => p.status === "paid")
    .reduce((sum: number, p: any) => sum + Number(p.amount), 0);

  const outstandingRevenue = (payments ?? [])
    .filter((p: any) => p.status === "pending")
    .reduce((sum: number, p: any) => sum + Number(p.amount), 0);

  // Revenue per company
  const revenueByCompany: Record<string, { name: string; paid: number; pending: number }> = {};
  for (const company of companies ?? []) {
    revenueByCompany[company.id] = { name: company.name, paid: 0, pending: 0 };
  }
  for (const p of payments ?? []) {
    const companyId = (p as any).communities?.community?.company_id;
    if (companyId && revenueByCompany[companyId]) {
      if (p.status === "paid") revenueByCompany[companyId].paid += Number(p.amount);
      else revenueByCompany[companyId].pending += Number(p.amount);
    }
  }

  const statCards = [
    { label: "Companies", value: totalCompanies, color: "#7c3aed", bg: "#f5f3ff" },
    { label: "Cleaners", value: totalCleaners, color: "#2563eb", bg: "#e8f0fe" },
    { label: "Admins", value: totalAdmins, color: "#0891b2", bg: "#ecfeff" },
    { label: "Villas", value: totalVillas, color: "#16a34a", bg: "#dcfce7" },
    { label: "Cars", value: totalCars, color: "#d97706", bg: "#fef3c7" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
      <p className="text-sm text-muted mb-6">All companies · live data</p>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        {statCards.map((s) => (
          <div key={s.label} className="rounded-card bg-white border border-line p-4">
            <div
              className="h-9 w-9 rounded-[10px] flex items-center justify-center text-sm font-bold mb-3"
              style={{ background: s.bg, color: s.color }}
            >
              {s.value}
            </div>
            <p className="text-xs text-muted font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Revenue summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        <div className="rounded-card bg-white border border-line p-5">
          <p className="text-xs text-muted mb-1">Total collected</p>
          <p className="text-2xl font-bold">AED {totalRevenue.toLocaleString()}</p>
        </div>
        <div className="rounded-card bg-white border border-line p-5">
          <p className="text-xs text-muted mb-1">Outstanding</p>
          <p className="text-2xl font-bold text-yellow-600">AED {outstandingRevenue.toLocaleString()}</p>
        </div>
      </div>

      {/* Revenue by company */}
      {Object.keys(revenueByCompany).length > 0 && (
        <div className="rounded-card bg-white border border-line p-5">
          <h2 className="font-bold mb-4">Revenue by company</h2>
          <div className="space-y-3">
            {Object.values(revenueByCompany).map((c) => (
              <div key={c.name} className="flex items-center justify-between">
                <span className="font-medium text-sm">{c.name}</span>
                <div className="text-right text-sm">
                  <span className="text-green-700 font-semibold">AED {c.paid.toLocaleString()} collected</span>
                  {c.pending > 0 && (
                    <span className="text-yellow-600 ml-3">AED {c.pending.toLocaleString()} pending</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
