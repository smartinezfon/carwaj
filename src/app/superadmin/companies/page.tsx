import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import NewCompanyForm from "./NewCompanyForm";
import EditCompanyForm from "./EditCompanyForm";

export const dynamic = "force-dynamic";

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default async function CompaniesPage() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  const admin = createAdminClient();

  const { data: companies } = await supabase
    .from("companies")
    .select("*")
    .order("created_at");

  const { data: employees } = await supabase
    .from("employees")
    .select("id, name, role, company_id, auth_user_id")
    .neq("role", "super_admin");

  const { data: communities } = await supabase
    .from("communities")
    .select("id, name, company_id");

  const { data: villas } = await supabase
    .from("villas")
    .select("id, villa_number, owner_name, community_id, cars(id), service_subscriptions(id, weekdays, time_window_start, time_window_end, price_per_clean, active)");

  const { data: payments } = await supabase
    .from("payments")
    .select("id, amount, status, villa_id");

  // Fetch auth emails for all admin employees via service role
  const adminEmployees = (employees ?? []).filter((e) => e.role === "admin");
  const emailByAuthId = new Map<string, string>();
  for (const emp of adminEmployees) {
    if (!emp.auth_user_id) continue;
    const { data: authUser } = await admin.auth.admin.getUserById(emp.auth_user_id);
    if (authUser?.user?.email) emailByAuthId.set(emp.auth_user_id, authUser.user.email);
  }

  // Group by company
  const communitiesByCompany = new Map<string, any[]>();
  for (const c of communities ?? []) {
    const list = communitiesByCompany.get(c.company_id) ?? [];
    list.push(c);
    communitiesByCompany.set(c.company_id, list);
  }

  const communityIds = new Set((communities ?? []).map((c) => c.id));
  const villasByCommunity = new Map<string, any[]>();
  for (const v of villas ?? []) {
    if (!communityIds.has(v.community_id)) continue;
    const list = villasByCommunity.get(v.community_id) ?? [];
    list.push(v);
    villasByCommunity.set(v.community_id, list);
  }

  const villaIds = new Set((villas ?? []).map((v) => v.id));
  const paymentsByVilla = new Map<string, any[]>();
  for (const p of payments ?? []) {
    if (!villaIds.has(p.villa_id)) continue;
    const list = paymentsByVilla.get(p.villa_id) ?? [];
    list.push(p);
    paymentsByVilla.set(p.villa_id, list);
  }

  const employeesByCompany = new Map<string, any[]>();
  for (const e of employees ?? []) {
    if (!e.company_id) continue;
    const list = employeesByCompany.get(e.company_id) ?? [];
    list.push(e);
    employeesByCompany.set(e.company_id, list);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">Companies</h1>
          <p className="text-sm text-muted mt-0.5">{companies?.length ?? 0} registered</p>
        </div>
        <NewCompanyForm />
      </div>

      <div className="space-y-4 mb-8">
        {(companies ?? []).map((company) => {
          const compCommunities = communitiesByCompany.get(company.id) ?? [];
          const compEmployees = employeesByCompany.get(company.id) ?? [];
          const compCleaners = compEmployees.filter((e) => e.role === "cleaner");
          const compAdmins = compEmployees.filter((e) => e.role === "admin");
          const firstAdmin = compAdmins[0] ?? null;

          let totalVillas = 0;
          let totalCars = 0;
          let collectedRevenue = 0;
          let pendingRevenue = 0;
          let monthlyRevenue = 0;

          for (const community of compCommunities) {
            const cvillas = villasByCommunity.get(community.id) ?? [];
            totalVillas += cvillas.length;
            for (const v of cvillas) {
              totalCars += (v.cars ?? []).length;
              const validSubs = (v.service_subscriptions ?? []).filter(
                (s: any) => s.weekdays?.length > 0 && s.active
              );
              for (const s of validSubs) monthlyRevenue += Number(s.price_per_clean);
              const vPayments = paymentsByVilla.get(v.id) ?? [];
              for (const p of vPayments) {
                if (p.status === "paid") collectedRevenue += Number(p.amount);
                else pendingRevenue += Number(p.amount);
              }
            }
          }

          const adminForEdit = firstAdmin
            ? {
                id: firstAdmin.id,
                name: firstAdmin.name,
                email: emailByAuthId.get(firstAdmin.auth_user_id) ?? "",
              }
            : null;

          return (
            <div key={company.id} className="rounded-card bg-white border border-line p-5">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold">{company.name}</h2>
                  {company.owner_name && (
                    <p className="text-sm text-muted mt-0.5">Owner: {company.owner_name}</p>
                  )}
                  {company.owner_email && (
                    <p className="text-sm text-muted">{company.owner_email}</p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    company.status === "active"    ? "bg-green-100 text-green-700"   :
                    company.status === "pending"   ? "bg-yellow-100 text-yellow-700" :
                                                     "bg-red-100 text-red-700"
                  }`}>
                    {company.status === "active" ? "Active" : company.status === "pending" ? "Pending" : "Suspended"}
                  </span>
                </div>
              </div>

              {/* Summary stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                {[
                  { label: "Communities", val: compCommunities.length },
                  { label: "Villas", val: totalVillas },
                  { label: "Cars", val: totalCars },
                  { label: "Cleaners", val: compCleaners.length },
                ].map((s) => (
                  <div key={s.label} className="bg-canvas rounded-control px-3 py-2 text-center">
                    <p className="text-lg font-bold">{s.val}</p>
                    <p className="text-xs text-muted">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Revenue */}
              <div className="grid grid-cols-3 gap-2 mb-5">
                <div className="bg-canvas rounded-control px-3 py-2">
                  <p className="text-xs text-muted">Monthly rate</p>
                  <p className="font-bold text-sm">AED {monthlyRevenue.toLocaleString()}</p>
                </div>
                <div className="bg-canvas rounded-control px-3 py-2">
                  <p className="text-xs text-muted">Collected</p>
                  <p className="font-bold text-sm text-green-700">AED {collectedRevenue.toLocaleString()}</p>
                </div>
                <div className="bg-canvas rounded-control px-3 py-2">
                  <p className="text-xs text-muted">Pending</p>
                  <p className="font-bold text-sm text-yellow-600">AED {pendingRevenue.toLocaleString()}</p>
                </div>
              </div>

              {/* Admin accounts */}
              {compAdmins.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">Admin accounts</p>
                  <div className="space-y-1">
                    {compAdmins.map((e) => (
                      <div key={e.id} className="text-sm text-gray-700 flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                        {e.name}
                        {emailByAuthId.get(e.auth_user_id) && (
                          <span className="text-muted text-xs">· {emailByAuthId.get(e.auth_user_id)}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Communities drill-down */}
              {compCommunities.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">Communities</p>
                  <div className="space-y-2">
                    {compCommunities.map((community) => {
                      const cvillas = villasByCommunity.get(community.id) ?? [];
                      return (
                        <div key={community.id} className="rounded-control border border-line p-3">
                          <p className="font-semibold text-sm mb-2">{community.name}</p>
                          <div className="space-y-1.5">
                            {cvillas.map((v) => {
                              const validSubs = (v.service_subscriptions ?? []).filter(
                                (s: any) => s.weekdays?.length > 0
                              );
                              return (
                                <div key={v.id} className="text-xs text-gray-600 flex flex-col gap-0.5">
                                  <span className="font-medium text-gray-800">
                                    Villa {v.villa_number} · {v.owner_name}
                                  </span>
                                  <span className="text-muted">
                                    {(v.cars ?? []).length} car{(v.cars ?? []).length !== 1 ? "s" : ""}
                                    {validSubs.length > 0 && (
                                      <> · {validSubs[0].weekdays.map((d: number) => WEEKDAY_LABELS[d]).join("/")} · AED {validSubs[0].price_per_clean}/mo</>
                                    )}
                                  </span>
                                </div>
                              );
                            })}
                            {cvillas.length === 0 && (
                              <p className="text-xs text-muted">No villas yet</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Inline edit form */}
              <EditCompanyForm company={company} admin={adminForEdit} />
            </div>
          );
        })}

        {(companies?.length ?? 0) === 0 && (
          <p className="text-center text-muted py-10">No companies yet. Add one below.</p>
        )}
      </div>

    </div>
  );
}
