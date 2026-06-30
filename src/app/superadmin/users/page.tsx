import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import UserCompanyAccordion, { type CompanyData } from "./UserCompanyAccordion";

export default async function UsersPage() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  const adminClient = createAdminClient();

  const [
    { data: companies },
    { data: employees },
    { data: communities },
    { data: villas },
    { data: authUsers },
  ] = await Promise.all([
    supabase.from("companies").select("id, name, status").order("name"),
    supabase.from("employees").select("id, name, role, company_id, auth_user_id, community_ids").neq("role", "super_admin").order("name"),
    supabase.from("communities").select("id, name, company_id"),
    supabase.from("villas").select("id, villa_number, community_id, service_subscriptions(id, weekdays, price_per_clean, active), cars(id)"),
    adminClient.auth.admin.listUsers(),
  ]);

  const emailByAuthId = new Map((authUsers?.users ?? []).map((u) => [u.id, u.email ?? ""]));
  const communityById = new Map((communities ?? []).map((c) => [c.id, c]));

  const villasByCommunity = new Map<string, any[]>();
  for (const v of villas ?? []) {
    const list = villasByCommunity.get(v.community_id) ?? [];
    list.push(v);
    villasByCommunity.set(v.community_id, list);
  }

  const employeesByCompany = new Map<string, any[]>();
  for (const e of employees ?? []) {
    if (!e.company_id) continue;
    const list = employeesByCompany.get(e.company_id) ?? [];
    list.push(e);
    employeesByCompany.set(e.company_id, list);
  }

  const companyData: CompanyData[] = (companies ?? [])
    .map((company) => {
      const compEmployees = employeesByCompany.get(company.id) ?? [];

      const users = compEmployees.map((emp: any) => {
        const email = emp.auth_user_id ? emailByAuthId.get(emp.auth_user_id) ?? "" : "";
        const assignedCommunities = (emp.community_ids ?? [])
          .map((cid: string) => communityById.get(cid))
          .filter(Boolean) as { id: string; name: string }[];

        const assignedVillas = assignedCommunities.flatMap(
          (c) => villasByCommunity.get(c.id) ?? []
        );

        const totalCars = assignedVillas.reduce(
          (sum: number, v: any) => sum + (v.cars?.length ?? 0), 0
        );

        const bookOfBusiness = assignedVillas.reduce((sum: number, v: any) =>
          sum + (v.service_subscriptions ?? [])
            .filter((s: any) => s.active && s.weekdays?.length > 0)
            .reduce((s2: number, s: any) => s2 + Number(s.price_per_clean), 0),
          0
        );

        const schedules = assignedVillas.flatMap((v: any) =>
          (v.service_subscriptions ?? [])
            .filter((s: any) => s.active && s.weekdays?.length > 0)
            .map((s: any) => ({ villa: v.villa_number, days: s.weekdays, price: s.price_per_clean }))
        );

        return { id: emp.id, name: emp.name, role: emp.role, email, communities: assignedCommunities, villas: assignedVillas.length, cars: totalCars, bookOfBusiness, schedules };
      });

      return { id: company.id, name: company.name, status: company.status, users };
    })
    .filter((c) => c.users.length > 0);

  const totalUsers = (employees ?? []).length;
  const totalCleaners = (employees ?? []).filter((e) => e.role === "cleaner").length;
  const totalAdmins = (employees ?? []).filter((e) => e.role === "admin").length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Users</h1>
        <p className="text-sm text-muted mt-0.5">
          {totalUsers} users · {totalAdmins} admin{totalAdmins !== 1 ? "s" : ""} · {totalCleaners} cleaner{totalCleaners !== 1 ? "s" : ""}
        </p>
      </div>

      {companyData.length > 0 ? (
        <UserCompanyAccordion companies={companyData} />
      ) : (
        <p className="text-center text-muted py-10">No users yet.</p>
      )}
    </div>
  );
}
