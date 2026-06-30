"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SuperAdminProfileForm({
  name: initialName,
  email: initialEmail,
  whatsapp: initialWhatsapp,
}: {
  name: string;
  email: string;
  whatsapp: string;
}) {
  const router = useRouter();
  const supabase = createClient();

  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [whatsapp, setWhatsapp] = useState(initialWhatsapp);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);

    if (newPassword && newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (newPassword && newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setBusy(true);

    // Update auth email and/or password if changed
    const authUpdates: { email?: string; password?: string } = {};
    if (email !== initialEmail) authUpdates.email = email;
    if (newPassword) authUpdates.password = newPassword;

    if (Object.keys(authUpdates).length > 0) {
      const { error: authError } = await supabase.auth.updateUser(authUpdates);
      if (authError) {
        setError(authError.message);
        setBusy(false);
        return;
      }
    }

    // Update employee row
    const { data: { user } } = await supabase.auth.getUser();
    const { error: empError } = await supabase
      .from("employees")
      .update({ name, whatsapp_number: whatsapp || null })
      .eq("auth_user_id", user!.id);

    if (empError) {
      setError(empError.message);
      setBusy(false);
      return;
    }

    setNewPassword("");
    setConfirmPassword("");
    setBusy(false);
    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-card bg-white border border-line p-6">
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      {saved && <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">Profile saved.</p>}

      <div>
        <label className="block text-sm font-medium mb-1">Name</label>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border border-line px-3 py-2.5 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Email</label>
        <input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-line px-3 py-2.5 text-sm"
        />
        {email !== initialEmail && (
          <p className="text-xs text-yellow-600 mt-1">You'll receive a confirmation email at the new address.</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">WhatsApp / Phone</label>
        <input
          value={whatsapp}
          onChange={(e) => setWhatsapp(e.target.value)}
          placeholder="+971xxxxxxxxx"
          className="w-full rounded-lg border border-line px-3 py-2.5 text-sm"
        />
      </div>

      <div className="h-px bg-line" />

      <div>
        <label className="block text-sm font-medium mb-1">New password <span className="text-muted font-normal">(leave blank to keep current)</span></label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          minLength={8}
          className="w-full rounded-lg border border-line px-3 py-2.5 text-sm"
        />
      </div>

      {newPassword && (
        <div>
          <label className="block text-sm font-medium mb-1">Confirm new password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full rounded-lg border border-line px-3 py-2.5 text-sm"
          />
        </div>
      )}

      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-lg bg-purple-700 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
      >
        {busy ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
