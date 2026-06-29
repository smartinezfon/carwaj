"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Role } from "@/lib/types";

export default function SetPasswordForm({ role }: { role: Role }) {
  const router = useRouter();
  const supabase = createClient();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match");
      return;
    }

    setBusy(true);

    const { error: updateAuthError } = await supabase.auth.updateUser({ password });
    if (updateAuthError) {
      setError(updateAuthError.message);
      setBusy(false);
      return;
    }

    const { data: userData } = await supabase.auth.getUser();
    if (userData.user) {
      await supabase
        .from("employees")
        .update({ must_change_password: false })
        .eq("auth_user_id", userData.user.id);
    }

    setBusy(false);
    router.push(role === "admin" ? "/admin" : "/cleaner");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <p className="rounded-control bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      <div>
        <label className="block text-[12.5px] font-semibold text-gray-600 mb-1.5">
          New password
        </label>
        <input
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-control border border-[#dde3ea] bg-[#fbfcfd] px-3.5 h-[46px] text-[14.5px] focus:border-blue-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-[12.5px] font-semibold text-gray-600 mb-1.5">
          Confirm password
        </label>
        <input
          type="password"
          required
          minLength={8}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="w-full rounded-control border border-[#dde3ea] bg-[#fbfcfd] px-3.5 h-[46px] text-[14.5px] focus:border-blue-500 focus:outline-none"
        />
      </div>

      <button
        type="submit"
        disabled={busy}
        className="w-full h-12 rounded-control bg-blue-600 text-white font-bold text-[15px] disabled:opacity-50 shadow-[0_8px_20px_-6px_rgba(37,99,235,.5)]"
      >
        {busy ? "Saving..." : "Set password & continue"}
      </button>
    </form>
  );
}
