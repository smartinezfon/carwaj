"use client";

import { useState } from "react";
import AddCarForm from "./AddCarForm";
import AddScheduleForm from "./AddScheduleForm";
import ScheduleBadge from "./ScheduleBadge";
import CarBadge from "./CarBadge";
import EditClientForm from "./EditClientForm";
import PaymentRow from "@/components/PaymentRow";

function daysOverdue(dueDate: string, today: string): number {
  const due = new Date(`${dueDate}T00:00:00`);
  const now = new Date(`${today}T00:00:00`);
  return Math.round((now.getTime() - due.getTime()) / (24 * 60 * 60 * 1000));
}

export default function ClientCard({
  villa,
  employeeId,
  payments,
  today,
}: {
  villa: any;
  employeeId: string;
  payments: any[];
  today: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const carIds = (villa.cars ?? []).map((c: any) => c.id);
  const validSchedules = (villa.service_subscriptions ?? []).filter(
    (sub: any) => sub.weekdays && sub.weekdays.length > 0
  );
  const hasSchedule = validSchedules.length > 0;

  const pendingPayment = payments.find((p) => p.status === "pending");
  const overdue = pendingPayment ? daysOverdue(pendingPayment.due_date, today) : 0;
  const relevantPayment = pendingPayment ?? payments[0];

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
              {overdue > 0 ? `${overdue}d overdue` : `AED ${pendingPayment.amount} due`}
            </span>
          ) : hasSchedule ? (
            <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
              Paid up
            </span>
          ) : null}
          <span className={`text-gray-400 transition-transform ${expanded ? "rotate-180" : ""}`}>▾</span>
        </div>
      </button>

      {expanded && (
        <div className="border-t px-4 py-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500">{villa.owner_whatsapp}</p>
            <button
              onClick={() => setEditing((e) => !e)}
              className="text-sm text-blue-600 font-medium"
            >
              {editing ? "Close" : "Edit"}
            </button>
          </div>

          {editing && (
            <div className="mt-3">
              <EditClientForm villa={villa} onClose={() => setEditing(false)} />
            </div>
          )}

          <div className="mt-3 flex flex-wrap gap-2">
            {villa.cars?.map((car: any) => <CarBadge key={car.id} car={car} />)}
            {(!villa.cars || villa.cars.length === 0) && (
              <span className="text-xs text-gray-400">No cars yet</span>
            )}
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {validSchedules.map((sub: any) => (
              <ScheduleBadge key={sub.id} subscription={sub} carIds={carIds} employeeId={employeeId} />
            ))}
          </div>

          <div className="mt-3 flex flex-col gap-2 border-t pt-3">
            <AddCarForm villaId={villa.id} />
            {!hasSchedule && (
              <AddScheduleForm villaId={villa.id} carIds={carIds} employeeId={employeeId} />
            )}
          </div>

          {relevantPayment && (
            <div className="mt-3 border-t pt-3 space-y-2">
              <p className="text-xs font-semibold text-gray-500 uppercase">Payment</p>
              <PaymentRow
                key={relevantPayment.id}
                payment={relevantPayment}
                overdueDays={relevantPayment.status === "pending" ? overdue : 0}
                showVilla={false}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
