"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

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

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export default function PaymentRow({ payment, overdueDays, showVilla = true }: PaymentRowProps) {
  const router = useRouter();
  const supabase = createClient();
  const [choosingMethod, setChoosingMethod] = useState(false);
  const [busy, setBusy] = useState(false);

  async function markPaid(method: "cash" | "transfer") {
    setBusy(true);
    await supabase
      .from("payments")
      .update({ status: "paid", payment_method: method, paid_at: new Date().toISOString() })
      .eq("id", payment.id);

    if (payment.subscription_id) {
      const [y, m, d] = payment.due_date.split("-").map(Number);
      const next = new Date(y, m - 1 + 1, d);
      const nextDue = `${next.getFullYear()}-${pad(next.getMonth() + 1)}-${pad(next.getDate())}`;
      await supabase.from("payments").insert({
        villa_id: payment.villa_id,
        employee_id: payment.employee_id,
        subscription_id: payment.subscription_id,
        amount: payment.amount,
        due_date: nextDue,
        status: "pending",
      });
    }

    setBusy(false);
    setChoosingMethod(false);
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
      ) : (
        <>
          <p className={`text-sm font-medium ${showVilla ? "mt-2" : ""} ${overdueDays > 0 ? "text-red-600" : "text-yellow-700"}`}>
            {overdueDays > 0
              ? `${overdueDays} day${overdueDays === 1 ? "" : "s"} overdue`
              : `Due ${payment.due_date}`}{" "}
            · AED {payment.amount}
          </p>

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
              <button
                onClick={() => setChoosingMethod(false)}
                className="w-full text-sm text-gray-500 py-1.5"
              >
                Cancel
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
