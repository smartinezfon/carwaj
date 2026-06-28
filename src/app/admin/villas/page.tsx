import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function VillasPage() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  const { data: villas } = await supabase
    .from("villas")
    .select("*, community:communities(name), cars(*), service_subscriptions(*)")
    .order("villa_number");

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Villas & Cars</h1>
        <p className="text-sm text-gray-500">
          Manage villas, their cars, and cleaning subscriptions in your Supabase table editor or
          via the API.
        </p>
      </div>
      <div className="space-y-4">
        {villas?.map((villa: any) => (
          <div key={villa.id} className="rounded-xl bg-white border shadow-sm p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">
                Villa {villa.villa_number} · {villa.community?.name}
              </h2>
              <span className="text-sm text-gray-500">{villa.owner_whatsapp}</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">Owner: {villa.owner_name}</p>

            <div className="mt-3">
              <h3 className="text-sm font-semibold text-gray-500 mb-1">Cars</h3>
              <ul className="space-y-1">
                {villa.cars?.map((car: any) => (
                  <li key={car.id} className="text-sm">
                    {car.color} {car.make} {car.model} — {car.plate_number}
                  </li>
                ))}
                {(!villa.cars || villa.cars.length === 0) && (
                  <li className="text-sm text-gray-400">No cars registered</li>
                )}
              </ul>
            </div>

            <div className="mt-3">
              <h3 className="text-sm font-semibold text-gray-500 mb-1">Subscriptions</h3>
              <ul className="space-y-1">
                {villa.service_subscriptions?.map((sub: any) => (
                  <li key={sub.id} className="text-sm">
                    {sub.frequency} · AED {sub.price_per_clean} ·{" "}
                    {sub.active ? "Active" : "Inactive"}
                  </li>
                ))}
                {(!villa.service_subscriptions || villa.service_subscriptions.length === 0) && (
                  <li className="text-sm text-gray-400">No subscription</li>
                )}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
