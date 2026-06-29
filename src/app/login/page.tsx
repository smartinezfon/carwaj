"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError || !data.session) {
      setError("Invalid email or password");
      setLoading(false);
      return;
    }

    const { data: employee } = await supabase
      .from("employees")
      .select("role, must_change_password")
      .eq("auth_user_id", data.session.user.id)
      .single();

    if (employee?.must_change_password) {
      router.push("/set-password");
    } else {
      router.push(employee?.role === "admin" ? "/admin" : "/cleaner");
    }
    router.refresh();
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-canvas px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-[392px] rounded-card bg-white border border-line p-9 shadow-[0_24px_60px_-32px_rgba(15,23,42,0.32)] space-y-0"
      >
        <div className="h-[46px] w-[46px] rounded-[13px] bg-blue-600 flex items-center justify-center mb-[22px] shadow-[0_6px_16px_rgba(37,99,235,.34)]">
          <svg width="25" height="25" viewBox="0 0 24 24" fill="none">
            <path
              d="M3 13.5l1.8-5.1A2.5 2.5 0 0 1 7.1 6.7h9.8a2.5 2.5 0 0 1 2.3 1.7l1.8 5.1"
              stroke="#fff"
              strokeWidth="1.9"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M3 13.5h18v3.2a1 1 0 0 1-1 1h-1.6a1 1 0 0 1-1-1v-.7H6.6v.7a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-3.2z"
              stroke="#fff"
              strokeWidth="1.9"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h1 className="text-[25px] font-extrabold tracking-tight m-0">Welcome back</h1>
        <p className="mt-[7px] mb-7 text-muted text-[14.5px]">Sign in to manage your cars and routes.</p>

        <div className="space-y-5">
          {error && (
            <p className="rounded-control bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          )}

          <div>
            <label className="block text-[12.5px] font-semibold text-gray-600 mb-1.5">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-control border border-[#dde3ea] bg-[#fbfcfd] px-3.5 h-[46px] text-[14.5px] focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[12.5px] font-semibold text-gray-600 mb-1.5">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-control border border-[#dde3ea] bg-[#fbfcfd] px-3.5 h-[46px] text-[14.5px] focus:border-blue-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-control bg-blue-600 text-white font-bold text-[15px] disabled:opacity-50 shadow-[0_8px_20px_-6px_rgba(37,99,235,.5)]"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </div>
      </form>
      <p className="mt-[22px] text-muted text-[12.5px]">Carwaj · car care, organised</p>
    </div>
  );
}
