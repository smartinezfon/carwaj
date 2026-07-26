"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Community } from "@/lib/types";
import CommunityPicker, { type PickedCommunity } from "./CommunityPicker";

export default function EditCommunityForm({ community }: { community: Community }) {
  const router = useRouter();
  const supabase = createClient();
  const [picked, setPicked] = useState<PickedCommunity | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!picked) return;
    setBusy(true);
    setError(null);
    const { error: updateError } = await supabase
      .from("communities")
      .update({ name: picked.name, location_description: picked.location })
      .eq("id", community.id);

    if (updateError) {
      setError(updateError.message);
      setBusy(false);
      return;
    }
    setBusy(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSave} className="mt-3 space-y-2 rounded-lg border bg-gray-50 p-3">
      {error && <p className="rounded bg-red-50 px-2 py-1 text-xs text-red-700">{error}</p>}
      <CommunityPicker initialName={community.name} onChange={setPicked} size="sm" />
      {picked && (
        <>
          <p className="text-xs text-gray-600">
            Saved as <span className="font-semibold">{picked.name}</span> — {picked.location}
          </p>
          <iframe
            className="w-full rounded border"
            height="140"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            src={`https://www.google.com/maps?q=${encodeURIComponent(picked.location)}&output=embed`}
          />
        </>
      )}
      <button
        type="submit"
        disabled={busy || !picked}
        className="rounded bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-50"
      >
        {busy ? "Saving..." : "Save"}
      </button>
    </form>
  );
}
