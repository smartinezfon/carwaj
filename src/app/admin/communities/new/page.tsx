"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import CommunityPicker, { type PickedCommunity } from "../CommunityPicker";

export default function NewCommunityPage() {
  const router = useRouter();
  const supabase = createClient();
  const [picked, setPicked] = useState<PickedCommunity | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!picked) return;
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
      .insert({
        name: picked.name,
        location_description: picked.location,
        company_id: emp?.company_id,
      });

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
        <CommunityPicker onChange={setPicked} />
        {picked && (
          <div>
            <p className="text-sm text-gray-600">
              Saved as <span className="font-semibold">{picked.name}</span> — {picked.location}
            </p>
            <iframe
              className="mt-2 w-full rounded-lg border"
              height="160"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://www.google.com/maps?q=${encodeURIComponent(picked.location)}&output=embed`}
            />
          </div>
        )}
        <button
          type="submit"
          disabled={busy || !picked}
          className="w-full rounded-lg bg-blue-600 py-2.5 font-semibold text-white disabled:opacity-50"
        >
          {busy ? "Saving..." : "Create Community"}
        </button>
      </form>
    </div>
  );
}
