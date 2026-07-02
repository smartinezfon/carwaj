"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface Community {
  id: string;
  name: string;
}

export default function NewClientForm({ communities }: { communities: Community[] }) {
  const router = useRouter();
  const supabase = createClient();
  const [communityId, setCommunityId] = useState(communities[0]?.id ?? "");
  const [villaNumber, setVillaNumber] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [ownerWhatsapp, setOwnerWhatsapp] = useState("+971");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    const { error: insertError } = await supabase.from("villas").insert({
      community_id: communityId,
      villa_number: villaNumber,
      owner_name: ownerName,
      owner_whatsapp: ownerWhatsapp,
      notes: notes || null,
    });

    if (insertError) {
      setError(insertError.message);
      setBusy(false);
      return;
    }

    const communityName = communities.find((c) => c.id === communityId)?.name ?? "";
    fetch("/api/slack/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "customer_added",
        payload: { villaNumber, communityName, ownerName },
      }),
    }).catch(() => {});

    router.push("/cleaner/clients");
    router.refresh();
  }

  if (communities.length === 0) {
    return (
      <p className="text-sm text-gray-500">
        You're not assigned to any community yet. Ask your admin to assign you to one.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-card bg-white border border-line p-4">
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <div>
        <label className="block text-sm font-medium mb-1">Community</label>
        <select
          value={communityId}
          onChange={(e) => setCommunityId(e.target.value)}
          className="w-full rounded-lg border px-3 py-3 text-base"
        >
          {communities.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Villa number</label>
        <input
          required
          value={villaNumber}
          onChange={(e) => setVillaNumber(e.target.value)}
          className="w-full rounded-lg border px-3 py-3 text-base"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Owner name</label>
        <input
          required
          value={ownerName}
          onChange={(e) => setOwnerName(e.target.value)}
          className="w-full rounded-lg border px-3 py-3 text-base"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Owner WhatsApp</label>
        <input
          required
          value={ownerWhatsapp}
          onChange={(e) => setOwnerWhatsapp(e.target.value)}
          placeholder="+971xxxxxxxxx"
          className="w-full rounded-lg border px-3 py-3 text-base"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full rounded-lg border px-3 py-3 text-base"
        />
      </div>
      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-lg bg-blue-600 py-3 text-base font-semibold text-white disabled:opacity-50"
      >
        {busy ? "Saving..." : "Create Client"}
      </button>
    </form>
  );
}
