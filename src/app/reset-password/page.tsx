"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import AuthCard, { Field, inputClass, submitClass } from "@/components/AuthCard";

type Status = "checking" | "ready" | "invalid";

export default function ResetPasswordPage() {
  const supabase = createClient();
  const [status, setStatus] = useState<Status>("checking");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Establish the recovery session from the emailed link. Supabase may deliver
  // it two ways depending on the client's flow type: PKCE puts a `code` in the
  // query string that we exchange ourselves, while the implicit flow puts
  // tokens in the URL hash which the browser client consumes on its own. Handle
  // both, because the link is often opened in a mail app's in-app browser
  // rather than the one that requested it.
  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session && !cancelled) {
        clearTimeout(timer);
        setStatus("ready");
      }
    });

    (async () => {
      const { data } = await supabase.auth.getSession();
      if (cancelled) return;
      if (data.session) {
        setStatus("ready");
        return;
      }

      const code = new URLSearchParams(window.location.search).get("code");
      const hasHashToken = window.location.hash.includes("access_token");

      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (cancelled) return;
        setStatus(exchangeError ? "invalid" : "ready");
        return;
      }

      if (hasHashToken) {
        // detectSessionInUrl handles this asynchronously; onAuthStateChange
        // above will fire. Give it a moment before calling the link bad.
        timer = setTimeout(() => {
          if (!cancelled) setStatus("invalid");
        }, 4000);
        return;
      }

      setStatus("invalid");
    })();

    return () => {
      cancelled = true;
      clearTimeout(timer);
      sub.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setError(updateError.message);
      setBusy(false);
      return;
    }

    // Someone who arrived here still holding a temporary password has now
    // chosen their own, so clear the flag — otherwise middleware bounces them
    // straight back to /set-password and asks again.
    const { data: userData } = await supabase.auth.getUser();
    if (userData.user) {
      await supabase
        .from("employees")
        .update({ must_change_password: false })
        .eq("auth_user_id", userData.user.id);
    }

    // Full navigation rather than router.push, matching the login page: it
    // guarantees the request carries the fresh auth cookie and cannot be served
    // from a stale service worker cache entry.
    window.location.href = "/app";
  }

  if (status === "checking") {
    return (
      <AuthCard title="Checking your link" subtitle="One moment…">
        <div className="flex justify-center py-2">
          <div className="w-7 h-7 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
        </div>
      </AuthCard>
    );
  }

  if (status === "invalid") {
    return (
      <AuthCard
        mark="alert"
        title="This link has expired"
        subtitle="Reset links are valid for 60 minutes and can only be used once."
        footer={
          <p className="mt-[22px] text-[12.5px]">
            <Link href="/login" className="font-bold text-blue-600 hover:text-blue-700">
              Back to sign in
            </Link>
          </p>
        }
      >
        <Link href="/forgot-password" className={`${submitClass} flex items-center justify-center`}>
          Request a new link
        </Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Choose a new password" subtitle="Must be at least 8 characters.">
      <form onSubmit={handleSubmit}>
        {error && (
          <p className="rounded-[10px] bg-red-50 px-3 py-2 text-sm text-red-700 mb-5">{error}</p>
        )}

        <Field label="New password" icon="lock">
          <input
            type="password"
            required
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
            placeholder="••••••••"
          />
        </Field>

        <Field label="Confirm password" icon="lock">
          <input
            type="password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className={inputClass}
            placeholder="••••••••"
          />
        </Field>

        <button type="submit" disabled={busy} className={submitClass}>
          {busy ? "Updating…" : "Update password"}
        </button>
      </form>
    </AuthCard>
  );
}
