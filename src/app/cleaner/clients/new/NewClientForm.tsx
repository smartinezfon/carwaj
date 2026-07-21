"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useT } from "@/lib/LanguageContext";

interface Community {
  id: string;
  name: string;
}

export default function NewClientForm({ communities }: { communities: Community[] }) {
  const router = useRouter();
  const supabase = createClient();
  const { t } = useT();
  const [communityId, setCommunityId] = useState(communities[0]?.id ?? "");
  const [villaNumber, setVillaNumber] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [ownerWhatsapp, setOwnerWhatsapp] = useState("+971");
  const [monthlyAmount, setMonthlyAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const { error: insertError } = await supabase.from("villas").insert({
      community_id: communityId,
      villa_number: villaNumber,
      owner_name: ownerName,
      owner_whatsapp: ownerWhatsapp,
      monthly_price: monthlyAmount ? Number(monthlyAmount) : null,
      onboarding_token: token,
      onboarding_expires_at: expiresAt,
    });

    if (insertError) {
      setError(insertError.message);
      setBusy(false);
      return;
    }

    // Send WhatsApp onboarding link to client (best-effort)
    fetch("/api/onboarding/init", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, ownerPhone: ownerWhatsapp, ownerName }),
    }).catch(() => {});

    // Slack notification (best-effort)
    const communityName = communities.find((c) => c.id === communityId)?.name ?? "";
    fetch("/api/slack/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "customer_added",
        payload: { villaNumber, communityName, communityId, ownerName },
      }),
    }).catch(() => {});

    router.push("/cleaner/clients");
    router.refresh();
  }

  if (communities.length === 0) {
    return <p className="text-sm text-gray-500">{t("new_client_no_community")}</p>;
  }

  return (
    <>
      <h1 className="text-xl font-bold">{t("new_client_title")}</h1>
      <form onSubmit={handleSubmit} className="space-y-4 rounded-card bg-white border border-line p-4">
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

        <div>
          <label className="block text-sm font-medium mb-1">{t("new_client_community")}</label>
          <select
            value={communityId}
            onChange={(e) => setCommunityId(e.target.value)}
            className="w-full rounded-lg border px-3 py-3 text-base"
          >
            {communities.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">{t("new_client_villa_number")}</label>
          <input
            required
            value={villaNumber}
            onChange={(e) => setVillaNumber(e.target.value)}
            className="w-full rounded-lg border px-3 py-3 text-base"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">{t("new_client_owner_name")}</label>
          <input
            required
            value={ownerName}
            onChange={(e) => setOwnerName(e.target.value)}
            className="w-full rounded-lg border px-3 py-3 text-base"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">{t("new_client_owner_whatsapp")}</label>
          <input
            required
            value={ownerWhatsapp}
            onChange={(e) => setOwnerWhatsapp(e.target.value)}
            placeholder="+971xxxxxxxxx"
            className="w-full rounded-lg border px-3 py-3 text-base"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">{t("new_client_amount")}</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">AED</span>
            <input
              required
              type="number"
              min="0"
              step="1"
              value={monthlyAmount}
              onChange={(e) => setMonthlyAmount(e.target.value)}
              placeholder="0"
              className="w-full rounded-lg border pl-14 pr-3 py-3 text-base"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-lg bg-blue-600 py-3 text-base font-semibold text-white disabled:opacity-50 min-h-11"
        >
          {busy ? t("profile_saving") : t("new_client_submit")}
        </button>

        <p className="text-center text-xs text-gray-400">
          {t("new_client_whatsapp_hint")}
        </p>
      </form>
    </>
  );
}
