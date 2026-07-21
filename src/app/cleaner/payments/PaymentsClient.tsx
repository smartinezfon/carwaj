"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useT } from "@/lib/LanguageContext";
import type { TKey } from "@/lib/i18n";

function timeliness(dueDate: string, paidAt: string, t: (k: TKey) => string) {
  const due = new Date(`${dueDate}T00:00:00`);
  const paidDateStr = new Date(paidAt).toISOString().slice(0, 10);
  const paid = new Date(`${paidDateStr}T00:00:00`);
  const days = Math.round((paid.getTime() - due.getTime()) / 86400000);
  if (days < 0) return { label: `${Math.abs(days)}d ${t("word_early")}`, tone: "bg-green-100 text-green-700" };
  if (days === 0) return { label: t("payments_on_time"), tone: "bg-blue-100 text-blue-700" };
  return { label: `${days}d ${t("word_late")}`, tone: "bg-red-100 text-red-700" };
}

type Step = "idle" | "confirm" | "method";

function PendingCard({ payment, onPaid }: { payment: any; onPaid: () => void }) {
  const [step, setStep] = useState<Step>("idle");
  const [busy, setBusy] = useState(false);
  const { t } = useT();
  const isOverdue = payment.overdueDays > 0;

  async function markPaid(method: "cash" | "transfer") {
    setBusy(true);
    await fetch(`/api/payments/${payment.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "paid", payment_method: method }),
    });
    setBusy(false);
    setStep("idle");
    onPaid();
  }

  return (
    <div className={`rounded-card bg-white border p-4 ${isOverdue ? "border-red-200" : "border-line"}`}>
      {/* Primary: Villa + community */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-base font-extrabold truncate">
            Villa {payment.villa?.villa_number}
            <span className="text-muted font-semibold"> · {payment.villa?.community?.name}</span>
          </p>
          <p className="text-xs text-muted mt-0.5 truncate">{payment.villa?.owner_name}</p>
        </div>
        <span className="shrink-0 text-base font-bold text-ink">AED {payment.amount}</span>
      </div>

      {/* Due date status */}
      <div className="mt-2">
        {isOverdue ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 bg-red-50 px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            {payment.overdueDays} {t("word_days")} {t("word_overdue")} · {t("word_was_due")} {payment.due_date}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            {t("word_due")} {payment.due_date}
          </span>
        )}
      </div>

      {/* Actions */}
      {step === "idle" && (
        <button
          onClick={() => setStep("confirm")}
          className="mt-3 w-full rounded-control bg-green-600 py-2.5 text-sm font-semibold text-white min-h-11"
        >
          {t("payments_mark_paid")}
        </button>
      )}

      {step === "confirm" && (
        <div className="mt-3 rounded-control bg-amber-50 border border-amber-200 p-3 space-y-3">
          <p className="text-sm font-semibold text-amber-900">
            {t("payments_did_receive", { amount: payment.amount, villa: payment.villa?.villa_number ?? "" })}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setStep("method")}
              className="flex-1 rounded-control bg-green-600 py-2.5 text-sm font-semibold text-white min-h-11"
            >
              {t("payments_yes_received")}
            </button>
            <button
              onClick={() => setStep("idle")}
              className="flex-1 rounded-control border-2 border-line py-2.5 text-sm font-semibold min-h-11"
            >
              {t("payments_cancel")}
            </button>
          </div>
        </div>
      )}

      {step === "method" && (
        <div className="mt-3 space-y-2">
          <p className="text-xs font-semibold text-muted">{t("payments_how_paid")}</p>
          <div className="flex gap-2">
            <button
              disabled={busy}
              onClick={() => markPaid("cash")}
              className="flex-1 rounded-control border-2 border-line py-2.5 text-sm font-semibold disabled:opacity-50 min-h-11"
            >
              💵 {t("payments_cash")}
            </button>
            <button
              disabled={busy}
              onClick={() => markPaid("transfer")}
              className="flex-1 rounded-control border-2 border-line py-2.5 text-sm font-semibold disabled:opacity-50 min-h-11"
            >
              🏦 {t("payments_transfer")}
            </button>
          </div>
          <button onClick={() => setStep("idle")} className="w-full text-sm text-muted py-1.5">
            {t("payments_cancel")}
          </button>
        </div>
      )}
    </div>
  );
}

function Section({ title, color, payments, onPaid }: {
  title: string;
  color: string;
  payments: any[];
  onPaid: () => void;
}) {
  const { t } = useT();
  if (payments.length === 0) return null;
  return (
    <div>
      <div className={`flex items-center gap-2 mb-3`}>
        <span className={`text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${color}`}>
          {title}
        </span>
        <span className="text-xs text-muted">{payments.length} {t("word_payments")}</span>
      </div>
      <div className="space-y-3">
        {payments.map((p) => <PendingCard key={p.id} payment={p} onPaid={onPaid} />)}
      </div>
    </div>
  );
}

export default function PaymentsClient({ pending, paid }: { pending: any[]; paid: any[] }) {
  const router = useRouter();
  const { t } = useT();
  const [tab, setTab] = useState<"pending" | "paid">("pending");

  const overdueCount = pending.filter((p) => p.overdueDays > 0).length;

  // Bucket pending payments
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(today); endOfWeek.setDate(today.getDate() + (6 - today.getDay()));
  const endOfNextWeek = new Date(endOfWeek); endOfNextWeek.setDate(endOfWeek.getDate() + 7);

  const overdue   = pending.filter(p => p.overdueDays > 0);
  const thisWeek  = pending.filter(p => { if (p.overdueDays > 0) return false; const d = new Date(`${p.due_date}T00:00:00`); return d <= endOfWeek; });
  const nextWeek  = pending.filter(p => { if (p.overdueDays > 0) return false; const d = new Date(`${p.due_date}T00:00:00`); return d > endOfWeek && d <= endOfNextWeek; });
  const later     = pending.filter(p => { if (p.overdueDays > 0) return false; const d = new Date(`${p.due_date}T00:00:00`); return d > endOfNextWeek; });

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-xl font-bold">{t("payments_title")}</h1>
        <p className="text-sm text-muted mt-0.5">
          {pending.length} {t("word_pending")} · {paid.length} {t("word_paid")}
        </p>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-1 bg-canvas rounded-control p-1 mb-5">
        <button
          onClick={() => setTab("pending")}
          className={`flex-1 rounded-[6px] py-2 text-sm font-semibold transition-colors ${
            tab === "pending" ? "bg-white shadow-sm text-ink" : "text-muted"
          }`}
        >
          {t("payments_pending_tab")}
          {overdueCount > 0 && (
            <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold">
              {overdueCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setTab("paid")}
          className={`flex-1 rounded-[6px] py-2 text-sm font-semibold transition-colors ${
            tab === "paid" ? "bg-white shadow-sm text-ink" : "text-muted"
          }`}
        >
          {t("payments_paid_tab")}
        </button>
      </div>

      {tab === "pending" && (
        <div className="space-y-6">
          {pending.length === 0 ? (
            <p className="text-center text-muted py-10">{t("payments_all_caught_up")}</p>
          ) : (
            <>
              <Section title={t("payments_overdue")} color="bg-red-100 text-red-700" payments={overdue} onPaid={() => router.refresh()} />
              <Section title={t("payments_this_week")} color="bg-amber-100 text-amber-700" payments={thisWeek} onPaid={() => router.refresh()} />
              <Section title={t("payments_next_week")} color="bg-blue-100 text-blue-700" payments={nextWeek} onPaid={() => router.refresh()} />
              <Section title={t("payments_later")} color="bg-gray-100 text-gray-600" payments={later} onPaid={() => router.refresh()} />
            </>
          )}
        </div>
      )}

      {tab === "paid" && (
        <div className="space-y-3">
          {paid.length === 0 ? (
            <p className="text-center text-muted py-10">{t("payments_none_recorded")}</p>
          ) : (
            paid.map((p: any) => {
              const { label, tone } = timeliness(p.due_date, p.paid_at, t);
              return (
                <div key={p.id} className="rounded-card bg-white border border-line p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-base font-extrabold truncate">
                        Villa {p.villa?.villa_number}
                        <span className="text-muted font-semibold"> · {p.villa?.community?.name}</span>
                      </p>
                      <p className="text-xs text-muted mt-0.5 truncate">{p.villa?.owner_name}</p>
                    </div>
                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${tone}`}>
                      {label}
                    </span>
                  </div>
                  <p className="text-sm text-ink mt-2">
                    AED {p.amount} · {p.payment_method} ·{" "}
                    {new Date(p.paid_at).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                  <p className="text-xs text-muted mt-0.5">{t("word_was_due")} {p.due_date}</p>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
