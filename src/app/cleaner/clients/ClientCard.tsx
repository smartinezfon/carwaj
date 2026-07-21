"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import AddCarForm from "./AddCarForm";
import AddScheduleForm from "./AddScheduleForm";
import ScheduleBadge from "./ScheduleBadge";
import EditClientForm from "./EditClientForm";
import PaymentRow from "@/components/PaymentRow";
import { useT } from "@/lib/LanguageContext";

function daysOverdue(dueDate: string, today: string): number {
  const due = new Date(`${dueDate}T00:00:00`);
  const now = new Date(`${today}T00:00:00`);
  return Math.round((now.getTime() - due.getTime()) / (24 * 60 * 60 * 1000));
}

export default function ClientCard({
  villa,
  employeeId,
  payments,
  history,
  today,
}: {
  villa: any;
  employeeId: string;
  payments: any[];
  history: any[];
  today: string;
}) {
  const router = useRouter();
  const supabase = createClient();
  const { t } = useT();
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [price, setPrice] = useState<string>(String(villa.monthly_price ?? 0));
  const [priceSaving, setPriceSaving] = useState(false);

  async function savePrice() {
    setPriceSaving(true);
    await supabase.from("villas").update({ monthly_price: Number(price) }).eq("id", villa.id);
    setPriceSaving(false);
    router.refresh();
  }

  const pendingPayment = payments.find((p) => p.status === "pending");
  const overdue = pendingPayment ? daysOverdue(pendingPayment.due_date, today) : 0;
  const relevantPayment = pendingPayment ?? payments[0];

  const cars: any[] = villa.cars ?? [];

  // Group subscriptions by car_id
  const subsByCarId = new Map<string, any[]>();
  (villa.service_subscriptions ?? []).forEach((sub: any) => {
    const key = sub.car_id ?? "__none__";
    const list = subsByCarId.get(key) ?? [];
    list.push(sub);
    subsByCarId.set(key, list);
  });

  const hasAnySchedule = (villa.service_subscriptions ?? []).some(
    (s: any) => s.weekdays && s.weekdays.length > 0
  );

  return (
    <div className="rounded-card bg-white border border-line overflow-hidden">
      <button
        onClick={() => setExpanded((e) => !e)}
        className="w-full text-left p-4 flex items-center justify-between gap-2"
      >
        <div className="min-w-0">
          <h2 className="text-base font-bold truncate">
            Villa {villa.villa_number} · {villa.community?.name}
          </h2>
          <p className="text-sm text-gray-500 truncate">{villa.owner_name}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {pendingPayment ? (
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                overdue > 0 ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {overdue > 0 ? `${overdue}d ${t("word_overdue")}` : `AED ${pendingPayment.amount} ${t("word_due")}`}
            </span>
          ) : hasAnySchedule ? (
            <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
              {t("client_paid_up")}
            </span>
          ) : null}
          <span className={`text-gray-400 transition-transform ${expanded ? "rotate-180" : ""}`}>▾</span>
        </div>
      </button>

      {expanded && (
        <div className="border-t px-4 py-3 space-y-4">
          {/* Header: contact + edit */}
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500">{villa.owner_whatsapp}</p>
            <button
              onClick={() => setEditing((e) => !e)}
              className="text-sm text-blue-600 font-medium"
            >
              {editing ? t("client_close") : t("client_edit")}
            </button>
          </div>

          {editing && (
            <EditClientForm villa={villa} onClose={() => setEditing(false)} />
          )}

          {/* Cars — each with its own schedule */}
          <div className="space-y-3">
            {cars.length === 0 && (
              <p className="text-xs text-gray-400">{t("client_no_cars")}</p>
            )}
            {cars.map((car: any) => {
              const carSubs = subsByCarId.get(car.id) ?? [];
              const validSubs = carSubs.filter((s) => s.weekdays?.length > 0);
              return (
                <div key={car.id} className="rounded-lg border border-line p-3 space-y-2">
                  <p className="text-sm font-semibold">
                    {car.color} {car.make} {car.model}
                    {car.plate_number && (
                      <span className="ml-1.5 text-xs font-normal text-gray-400">
                        · {car.plate_number}
                      </span>
                    )}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {validSubs.map((sub: any) => (
                      <ScheduleBadge
                        key={sub.id}
                        subscription={sub}
                        carId={car.id}
                        employeeId={employeeId}
                      />
                    ))}
                  </div>
                  {validSubs.length === 0 && (
                    <AddScheduleForm
                      villaId={villa.id}
                      carId={car.id}
                      employeeId={employeeId}
                      villaPrice={Number(price) || villa.monthly_price || 0}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Add car */}
          <div className="border-t pt-3">
            <AddCarForm villaId={villa.id} />
          </div>

          {/* Payment */}
          {relevantPayment && (
            <div className="border-t pt-3 space-y-2">
              <p className="text-xs font-semibold text-gray-500 uppercase">{t("client_payment_section")}</p>
              <PaymentRow
                key={relevantPayment.id}
                payment={relevantPayment}
                overdueDays={relevantPayment.status === "pending" ? overdue : 0}
                showVilla={false}
              />
            </div>
          )}

          {/* Job history */}
          {history.length > 0 && (
            <div className="border-t pt-3">
              <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                {t("client_history")} ({history.length})
              </p>
              <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
                {history.map((b: any) => (
                  <a
                    key={b.id}
                    href={`/cleaner/booking/${b.id}`}
                    className="flex-shrink-0 w-24 rounded-lg overflow-hidden border border-line"
                  >
                    {b.after_photo_url ? (
                      <img
                        src={b.after_photo_url}
                        alt="After"
                        className="w-24 h-20 object-cover"
                      />
                    ) : (
                      <div className="w-24 h-20 bg-gray-100 flex items-center justify-center">
                        <span className="text-2xl">🚗</span>
                      </div>
                    )}
                    <div className="p-1.5">
                      <p className="text-[10px] font-medium text-gray-600 truncate">
                        {b.car?.make} {b.car?.model}
                      </p>
                      <p className="text-[10px] text-gray-400">{b.scheduled_date}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
