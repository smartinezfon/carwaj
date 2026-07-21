"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Villa, VillaStatus } from "@/lib/types";
import { useT } from "@/lib/LanguageContext";

const STATUS_OPTIONS: { value: VillaStatus; tKey: "status_active" | "status_paused" | "status_former"; color: string }[] = [
  { value: "active", tKey: "status_active", color: "bg-green-100 text-green-700" },
  { value: "paused", tKey: "status_paused", color: "bg-amber-100 text-amber-700" },
  { value: "former", tKey: "status_former", color: "bg-gray-100 text-gray-500" },
];

export default function EditClientForm({
  villa,
  onClose,
}: {
  villa: Villa;
  onClose: () => void;
}) {
  const router = useRouter();
  const supabase = createClient();
  const { t } = useT();
  const [villaNumber, setVillaNumber] = useState(villa.villa_number);
  const [ownerName, setOwnerName] = useState(villa.owner_name);
  const [ownerWhatsapp, setOwnerWhatsapp] = useState(villa.owner_whatsapp);
  const [notes, setNotes] = useState(villa.notes ?? "");
  const [monthlyPrice, setMonthlyPrice] = useState(villa.monthly_price != null ? String(villa.monthly_price) : "");
  const [status, setStatus] = useState<VillaStatus>(villa.status ?? "active");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    const { error: updateError } = await supabase
      .from("villas")
      .update({
        villa_number: villaNumber,
        owner_name: ownerName,
        owner_whatsapp: ownerWhatsapp,
        notes: notes || null,
        monthly_price: monthlyPrice ? Number(monthlyPrice) : null,
        status,
      })
      .eq("id", villa.id);

    if (updateError) {
      setError(updateError.message);
      setBusy(false);
      return;
    }
    setBusy(false);
    onClose();
    router.refresh();
  }

  return (
    <form onSubmit={handleSave} className="space-y-3 rounded-lg border bg-gray-50 p-3">
      {error && <p className="rounded bg-red-50 px-2 py-1 text-xs text-red-700">{error}</p>}

      {/* Status toggle */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1.5">{t("edit_status")}</label>
        <div className="flex gap-2">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setStatus(opt.value)}
              className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all min-h-11 ${
                status === opt.value
                  ? opt.color + " ring-2 ring-offset-1 ring-current"
                  : "bg-white border text-gray-400"
              }`}
            >
              {t(opt.tKey)}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1">{t("edit_villa_number")}</label>
        <input
          required
          value={villaNumber}
          onChange={(e) => setVillaNumber(e.target.value)}
          className="w-full rounded border px-2 py-2.5 text-sm min-h-11"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1">{t("edit_owner_name")}</label>
        <input
          required
          value={ownerName}
          onChange={(e) => setOwnerName(e.target.value)}
          className="w-full rounded border px-2 py-2.5 text-sm min-h-11"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1">{t("edit_owner_whatsapp")}</label>
        <input
          required
          value={ownerWhatsapp}
          onChange={(e) => setOwnerWhatsapp(e.target.value)}
          className="w-full rounded border px-2 py-2.5 text-sm min-h-11"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1">{t("edit_amount")}</label>
        <div className="flex items-center rounded border overflow-hidden bg-white">
          <span className="px-2.5 py-2.5 text-sm text-gray-500 bg-gray-50 border-r">AED</span>
          <input
            type="number"
            min="0"
            value={monthlyPrice}
            onChange={(e) => setMonthlyPrice(e.target.value)}
            placeholder="0"
            className="flex-1 px-2 py-2.5 text-sm min-h-11 outline-none"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1">{t("edit_notes")}</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full rounded border px-2 py-2.5 text-sm"
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={busy}
          className="flex-1 rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white disabled:opacity-50 min-h-11"
        >
          {busy ? t("profile_saving") : t("edit_save")}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border px-4 py-2.5 text-sm font-medium text-gray-600 min-h-11"
        >
          {t("edit_cancel")}
        </button>
      </div>
    </form>
  );
}
