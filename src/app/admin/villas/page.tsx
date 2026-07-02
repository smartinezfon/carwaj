import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default async function VillasPage() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  const [{ data: villas }, { data: employees }, { data: subBookingLinks }] = await Promise.all([
    supabase
      .from("villas")
      .select("*, community:communities(name), cars(*), service_subscriptions(*)")
      .order("villa_number"),
    supabase.from("employees").select("id, name"),
    supabase.from("bookings").select("subscription_id, employee_id").not("subscription_id", "is", null),
  ]);

  const employeeNameById = new Map((employees ?? []).map((e) => [e.id, e.name]));
  const employeeBySubscription = new Map<string, string>();
  (subBookingLinks ?? []).forEach((b: any) => {
    if (b.subscription_id && !employeeBySubscription.has(b.subscription_id)) {
      employeeBySubscription.set(b.subscription_id, b.employee_id);
    }
  });

  let totalBookOfBusiness = 0;
  const villasWithValidSchedules = (villas ?? []).map((villa: any) => {
    const validSchedules = (villa.service_subscriptions ?? []).filter(
      (sub: any) => sub.weekdays && sub.weekdays.length > 0
    );
    validSchedules.forEach((sub: any) => {
      totalBookOfBusiness += Number(sub.price_per_clean);
    });

    const cleanerNames = Array.from(
      new Set(
        validSchedules
          .map((sub: any) => employeeBySubscription.get(sub.id))
          .filter(Boolean)
          .map((id: string) => employeeNameById.get(id) ?? "Unknown")
      )
    );

    return { ...villa, validSchedules, cleanerNames };
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Villas</h1>
        <div className="rounded-card bg-white border border-line px-5 py-3 text-right">
          <p className="text-xs text-gray-500">Total book of business</p>
          <p className="text-xl font-bold">AED {totalBookOfBusiness.toLocaleString()}/mo</p>
        </div>
      </div>
      <p className="text-sm text-gray-500 mb-4">
        Villas, cars and schedules are managed by cleaners from their app. This is a read-only
        overview.
      </p>
      <div className="space-y-4">
        {villasWithValidSchedules.map((villa: any) => (
          <div key={villa.id} className="rounded-card bg-white border border-line p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">
                Villa {villa.villa_number} · {villa.community?.name}
              </h2>
              <span className="text-sm text-gray-500">{villa.owner_whatsapp}</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">Owner: {villa.owner_name}</p>
            <p className="text-sm text-gray-600 mt-0.5">
              Cleaner:{" "}
              {villa.cleanerNames.length > 0 ? (
                <span className="font-medium text-gray-800">{villa.cleanerNames.join(", ")}</span>
              ) : (
                <span className="text-gray-400">Unassigned</span>
              )}
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              {villa.cars?.map((car: any) => {
                const swatchMap: Record<string, string> = {
                  white: "#f1f3f6", black: "#2b2f36", silver: "#c8ccd2",
                  grey: "#9aa0a8", gray: "#9aa0a8", blue: "#2f4a6b", red: "#8a3030",
                };
                const swatch = swatchMap[car.color?.toLowerCase()] ?? "#e6eaef";
                return (
                  <span
                    key={car.id}
                    className="inline-flex items-center gap-[7px] text-xs font-semibold text-[#374151] bg-[#f1f3f6] px-[11px] py-[5px] rounded-full"
                  >
                    <span className="w-3.5 h-3.5 rounded-[5px] border border-black/[0.07] shrink-0" style={{ background: swatch }} />
                    {car.color} {car.make} {car.model}
                  </span>
                );
              })}
              {(!villa.cars || villa.cars.length === 0) && (
                <span className="text-xs text-gray-400">No cars yet</span>
              )}
            </div>

            <div className="mt-2 flex flex-wrap gap-2">
              {villa.validSchedules.map((sub: any) => (
                <span
                  key={sub.id}
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                    sub.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {sub.weekdays.map((d: number) => WEEKDAY_LABELS[d]).join("/")} ·{" "}
                  {sub.time_window_start?.slice(0, 5)}-{sub.time_window_end?.slice(0, 5)} · AED{" "}
                  {sub.price_per_clean}/mo
                </span>
              ))}
            </div>
          </div>
        ))}
        {villasWithValidSchedules.length === 0 && (
          <p className="text-center text-gray-500 py-10">No villas yet.</p>
        )}
      </div>
    </div>
  );
}
