"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Community } from "@/lib/types";

export default function EditCommunityForm({ community }: { community: Community }) {
  const router = useRouter();
  const supabase = createClient();
  const [name, setName] = useState(community.name);
  const [locationDescription, setLocationDescription] = useState(
    community.location_description ?? ""
  );
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error: updateError } = await supabase
      .from("communities")
      .update({ name, location_description: locationDescription || null })
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
      <input
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full rounded border px-2 py-1 text-sm"
        placeholder="Name"
      />
      <input
        value={locationDescription}
        onChange={(e) => setLocationDescription(e.target.value)}
        className="w-full rounded border px-2 py-1 text-sm"
        placeholder="Location / address"
      />
      {locationDescription && (
        <iframe
          className="w-full rounded border"
          height="140"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          src={`https://www.google.com/maps?q=${encodeURIComponent(locationDescription)}&output=embed`}
        />
      )}
      <button
        type="submit"
        disabled={busy}
        className="rounded bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-50"
      >
        {busy ? "Saving..." : "Save"}
      </button>
    </form>
  );
}
