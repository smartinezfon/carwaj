"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function NewCommunityPage() {
  const router = useRouter();
  const supabase = createClient();
  const [name, setName] = useState("");
  const [locationDescription, setLocationDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    const { data: { user } } = await supabase.auth.getUser();
    const { data: emp } = await supabase
      .from("employees")
      .select("company_id")
      .eq("auth_user_id", user!.id)
      .single();

    const { error: insertError } = await supabase
      .from("communities")
      .insert({ name, location_description: locationDescription || null, company_id: emp?.company_id });

    if (insertError) {
      setError(insertError.message);
      setBusy(false);
      return;
    }
    router.push("/admin/communities");
    router.refresh();
  }

  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-bold mb-6">New Community</h1>
      <form onSubmit={handleSubmit} className="space-y-4 rounded-card bg-white border border-line p-6">
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Location / address</label>
          <input
            value={locationDescription}
            onChange={(e) => setLocationDescription(e.target.value)}
            placeholder="e.g. Arabian Ranches, Dubai"
            className="w-full rounded-lg border px-3 py-2"
          />
          <p className="mt-1 text-xs text-gray-500">
            Used to show this community on a map — enter an address or area name.
          </p>
          {locationDescription && (
            <iframe
              className="mt-2 w-full rounded-lg border"
              height="160"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://www.google.com/maps?q=${encodeURIComponent(locationDescription)}&output=embed`}
            />
          )}
        </div>
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-lg bg-blue-600 py-2.5 font-semibold text-white disabled:opacity-50"
        >
          {busy ? "Saving..." : "Create Community"}
        </button>
      </form>
    </div>
  );
}
