"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Employee } from "@/lib/types";

export default function ProfileForm({ employee }: { employee: Employee }) {
  const router = useRouter();
  const supabase = createClient();
  const [name, setName] = useState(employee.name);
  const [whatsappNumber, setWhatsappNumber] = useState(employee.whatsapp_number ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setSaved(false);

    const { error: updateError } = await supabase
      .from("employees")
      .update({ name, whatsapp_number: whatsappNumber || null })
      .eq("id", employee.id);

    if (updateError) {
      setError(updateError.message);
      setBusy(false);
      return;
    }
    setBusy(false);
    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-card bg-white border border-line p-4">
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      {saved && (
        <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">Saved.</p>
      )}
      <div>
        <label className="block text-sm font-medium mb-1">Name</label>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border px-3 py-3 text-base"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Phone number</label>
        <input
          value={whatsappNumber}
          onChange={(e) => setWhatsappNumber(e.target.value)}
          placeholder="+971xxxxxxxxx"
          className="w-full rounded-lg border px-3 py-3 text-base"
        />
      </div>
      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-lg bg-blue-600 py-3 text-base font-semibold text-white disabled:opacity-50 min-h-11"
      >
        {busy ? "Saving..." : "Save"}
      </button>

      <button
        type="button"
        onClick={async () => {
          await supabase.auth.signOut();
          window.location.href = "/login";
        }}
        className="w-full rounded-lg bg-red-600 py-3 text-base font-semibold text-white min-h-11"
      >
        Log out
      </button>
    </form>
  );
}
