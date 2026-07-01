"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface PaymentRowProps {
  payment: {
    id: string;
    villa_id: string;
    employee_id: string | null;
    subscription_id: string | null;
    amount: number;
    due_date: string;
    status: "pending" | "paid";
    payment_method: string | null;
    paid_at: string | null;
    villa?: { villa_number: string; owner_name: string } | null;
  };
  overdueDays: number;
  showVilla?: boolean;
}

export default function PaymentRow({ payment, overdueDays, showVilla = true }: PaymentRowProps) {
  const router = useRouter();
  const [choosingMethod, setChoosingMethod] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editAmount, setEditAmount] = useState(String(payment.amount));
  const [editDueDate, setEditDueDate] = useState(payment.due_date);
  const [busy, setBusy] = useState(false);

  async function markPaid(method: "cash" | "transfer") {
    setBusy(true);
    await fetch(`/api/payments/${payment.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "paid", payment_method: method }),
    });
    setBusy(false);
    setChoosingMethod(false);
    router.refresh();
  }

  async function saveEdit() {
    setBusy(true);
    await fetch(`/api/payments/${payment.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: Number(editAmount), due_date: editDueDate }),
    });
    setBusy(false);
    setEditing(false);
    router.refresh();
  }

  return (
    <div className={showVilla ? "rounded-card bg-white border border-line p-4" : ""}>
      {showVilla && (
        <div className="flex items-center justify-between">
          <h3 className="font-bold">Villa {payment.villa?.villa_number}</h3>
          <span className="text-sm text-gray-500">AED {payment.amount}</span>
        </div>
      )}
      {showVilla && <p className="text-sm text-gray-600 mt-0.5">{payment.villa?.owner_name}</p>}

      {payment.status === "paid" ? (
        <p className="text-sm text-green-700 font-medium mt-2">
          Paid via {payment.payment_method}
          {payment.paid_at ? ` on ${new Date(payment.paid_at).toLocaleDateString()}` : ""}
        </p>
      ) : editing ? (
        <div className="space-y-2 mt-2">
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">Amount (AED)</p>
            <input
              type="number"
              step="0.01"
              value={editAmount}
              onChange={(e) => setEditAmount(e.target.value)}
              className="w-full rounded-lg border border-line px-3 py-2 text-sm"
            />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">Due date</p>
            <input
              type="date"
              value={editDueDate}
              onChange={(e) => setEditDueDate(e.target.value)}
              className="w-full rounded-lg border border-line px-3 py-2 text-sm"
            />
          </div>
          <div className="flex gap-2 pt-1">
            <button
              onClick={saveEdit}
              disabled={busy}
              className="flex-1 rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white disabled:opacity-50 min-h-11"
            >
              {busy ? "Saving…" : "Save"}
            </button>
            <button
              onClick={() => setEditing(false)}
              className="rounded-lg border border-line px-4 py-2.5 text-sm font-medium text-gray-600 min-h-11"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className={`flex items-center justify-between ${showVilla ? "mt-2" : ""}`}>
            <p className={`text-sm font-medium ${overdueDays > 0 ? "text-red-600" : "text-yellow-700"}`}>
              {overdueDays > 0
                ? `${overdueDays} day${overdueDays === 1 ? "" : "s"} overdue`
                : `Due ${payment.due_date}`}{" "}
              · AED {payment.amount}
            </p>
            <button
              onClick={() => setEditing(true)}
              className="text-xs text-blue-600 font-medium ml-2"
            >
              Edit
            </button>
          </div>

          {!choosingMethod ? (
            <button
              onClick={() => setChoosingMethod(true)}
              className="mt-3 w-full rounded-lg bg-green-600 py-2.5 text-sm font-semibold text-white min-h-11"
            >
              Mark as Paid
            </button>
          ) : (
            <div className="mt-3 space-y-2">
              <p className="text-xs font-semibold text-gray-500">How was it paid?</p>
              <div className="flex gap-2">
                <button
                  disabled={busy}
                  onClick={() => markPaid("cash")}
                  className="flex-1 rounded-lg border-2 border-gray-300 py-2.5 text-sm font-semibold disabled:opacity-50 min-h-11"
                >
                  Cash
                </button>
                <button
                  disabled={busy}
                  onClick={() => markPaid("transfer")}
                  className="flex-1 rounded-lg border-2 border-gray-300 py-2.5 text-sm font-semibold disabled:opacity-50 min-h-11"
                >
                  Bank Transfer
                </button>
              </div>
              <button onClick={() => setChoosingMethod(false)} className="w-full text-sm text-gray-500 py-1.5">
                Cancel
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
