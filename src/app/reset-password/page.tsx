"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import AuthCard, { Field, inputClass, submitClass } from "@/components/AuthCard";

type Status = "checking" | "ready" | "invalid";

/**
 * Recovery tokens are single-use and are spent the moment the link is fetched.
 * Mail providers run link scanners that fetch every URL in a message to check
 * for phishing, so a link built on {{ .ConfirmationURL }} — which verifies on
 * GET — is routinely burnt before the recipient ever clicks it, and they get
 * "expired" seconds after the email lands.
 *
 * So nothing is verified on page load. We carry the token_hash through to the
 * submit handler and spend it there, alongside the password update: a scanner
 * can fetch this page all it likes without consuming anything, because only a
 * real submit does. This also avoids PKCE, whose code_verifier lives in the
 * browser that requested the reset — frequently not the one the mail app opens
 * the link in.
 *
 * Requires the Supabase "Reset Password" template to link to:
 *   {{ .SiteURL }}/reset-password?token_hash={{ .TokenHash }}&type=recovery
 */
export default function ResetPasswordPage() {
  const supabase = createClient();
  const [status, setStatus] = useState<Status>("checking");
  const [tokenHash, setTokenHash] = useState<string | null>(null);
  const [otpType, setOtpType] = useState<string>("recovery");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    // Supabase reports failures in the hash on some flows and the query on others.
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));

    const errorCode = query.get("error_code") ?? hash.get("error_code");
    const errorDesc = query.get("error_description") ?? hash.get("error_description");
    if (errorCode) {
      setError(errorDesc ? errorDesc.replace(/\+/g, " ") : errorCode);
      setStatus("invalid");
      return;
    }

    const hashed = query.get("token_hash");
    if (hashed) {
      setTokenHash(hashed);
      setOtpType(query.get("type") ?? "recovery");
      setStatus("ready");
      return;
    }

    // Older links (and any flow that established a session before landing here)
    // arrive already authenticated; let those through without a token to spend.
    supabase.auth.getSession().then(({ data }) => {
      setStatus(data.session ? "ready" : "invalid");
    });
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

    // Spend the token here, not on page load — see the note above.
    if (tokenHash) {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        type: otpType as "recovery",
        token_hash: tokenHash,
      });
      if (verifyError) {
        setError(null);
        setStatus("invalid");
        setBusy(false);
        return;
      }
    }

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
    // from a stale service worker entry.
    window.location.href = "/app";
  }

  if (status === "checking") {
    return (
      <AuthCard title="Opening your link" subtitle="One moment…">
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
        {error && (
          <p className="rounded-[10px] bg-red-50 px-3 py-2 text-sm text-red-700 mb-5">{error}</p>
        )}
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
