"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import AuthCard, { Field, inputClass, submitClass } from "@/components/AuthCard";

export default function ForgotPasswordPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function sendLink(address: string) {
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(address, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    // Supabase does not distinguish unknown addresses, and neither do we —
    // reporting "no such account" would let anyone probe for valid emails.
    // Only genuine transport failures surface here.
    if (resetError) throw new Error(resetError.message);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await sendLink(email);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send the reset link");
    }
    setBusy(false);
  }

  async function handleResend() {
    setError(null);
    setBusy(true);
    try {
      await sendLink(email);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not resend the link");
    }
    setBusy(false);
  }

  if (sent) {
    return (
      <AuthCard
        mark="mail"
        title="Check your email"
        subtitle={`We sent a reset link to ${email}. It expires in 60 minutes.`}
        footer={
          <p className="mt-[22px] text-[12.5px] text-muted">
            Didn&apos;t get it?{" "}
            <button
              onClick={handleResend}
              disabled={busy}
              className="font-bold text-blue-600 hover:text-blue-700 disabled:opacity-50"
            >
              {busy ? "Resending…" : "Resend"}
            </button>
            {" · "}
            <Link href="/login" className="font-bold text-blue-600 hover:text-blue-700">
              Back to sign in
            </Link>
          </p>
        }
      >
        {error && (
          <p className="rounded-[10px] bg-red-50 px-3 py-2 text-sm text-red-700 mb-5">{error}</p>
        )}
        <p className="text-[13.5px] text-muted">
          Check your spam folder if it hasn&apos;t arrived in a couple of minutes.
        </p>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Reset your password"
      subtitle="Enter the email you sign in with and we'll send you a reset link."
    >
      <form onSubmit={handleSubmit}>
        {error && (
          <p className="rounded-[10px] bg-red-50 px-3 py-2 text-sm text-red-700 mb-5">{error}</p>
        )}

        <Field label="Email" icon="mail">
          <input
            type="email"
            required
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            placeholder="you@example.com"
          />
        </Field>

        <button type="submit" disabled={busy} className={submitClass}>
          {busy ? "Sending…" : "Send reset link"}
        </button>
      </form>
    </AuthCard>
  );
}
