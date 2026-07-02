"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function CarLogo({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M3.6 15.2l1.5-3.9A2.5 2.5 0 0 1 7.4 9.6h7.2a2.5 2.5 0 0 1 2.3 1.6l1.5 3.9" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M3 15.2h16v2a1 1 0 0 1-1 1h-.3a1 1 0 0 1-1-1v-.2H5.3v.2a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-2z" stroke="#fff" strokeWidth="1.7" strokeLinejoin="round"/>
      <circle cx="7.3" cy="16.1" r="1.3" fill="#2563eb" stroke="#fff" strokeWidth="1.2"/>
      <circle cx="14.7" cy="16.1" r="1.3" fill="#2563eb" stroke="#fff" strokeWidth="1.2"/>
      <path d="M19.4 4.2C19.6 5.9 20.1 6.4 21.8 6.6C20.1 6.8 19.6 7.3 19.4 9C19.2 7.3 18.7 6.8 17 6.6C18.7 6.4 19.2 5.9 19.4 4.2Z" fill="#fff"/>
    </svg>
  );
}

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

    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });

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
        className="w-full max-w-[392px] rounded-[22px] bg-white border border-[#e6eaef] p-[38px_34px] shadow-[0_24px_60px_-32px_rgba(15,23,42,.32)] space-y-0"
      >
        {/* Logo */}
        <div className="w-12 h-12 rounded-[15px] bg-blue-600 flex items-center justify-center mb-[22px] shadow-[0_10px_22px_-8px_rgba(37,99,235,.55)]">
          <CarLogo size={27} />
        </div>

        <h1 className="text-[25px] font-extrabold tracking-[-0.025em] m-0">Welcome back</h1>
        <p className="mt-[7px] mb-7 text-[#7b8696] text-[14.5px]">Sign in to manage your cars and routes.</p>

        {error && (
          <p className="rounded-[10px] bg-red-50 px-3 py-2 text-sm text-red-700 mb-5">{error}</p>
        )}

        {/* Email */}
        <div className="mb-4">
          <label className="block text-[12.5px] font-semibold text-[#4a5563] mb-[7px]">Email</label>
          <div className="flex items-center gap-[9px] border border-[#dde3ea] rounded-[12px] px-[13px] h-[46px] bg-[#fbfcfd] focus-within:border-blue-500">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" className="shrink-0">
              <rect x="3" y="5" width="18" height="14" rx="2.5" stroke="#9aa3af" strokeWidth="1.7"/>
              <path d="M4 7l8 5 8-5" stroke="#9aa3af" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-transparent text-[14.5px] text-[#0f172a] outline-none placeholder:text-[#9aa3af]"
              placeholder="you@example.com"
            />
          </div>
        </div>

        {/* Password */}
        <div className="mb-6">
          <label className="block text-[12.5px] font-semibold text-[#4a5563] mb-[7px]">Password</label>
          <div className="flex items-center gap-[9px] border border-[#dde3ea] rounded-[12px] px-[13px] h-[46px] bg-[#fbfcfd] focus-within:border-blue-500">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" className="shrink-0">
              <rect x="5" y="11" width="14" height="9" rx="2" stroke="#9aa3af" strokeWidth="1.7"/>
              <path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="#9aa3af" strokeWidth="1.7" strokeLinecap="round"/>
            </svg>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="flex-1 bg-transparent text-[14.5px] text-[#0f172a] outline-none placeholder:text-[#9aa3af]"
              placeholder="••••••••"
            />
          </div>
        </div>

        {/* Sign in button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 rounded-[12px] bg-blue-600 hover:bg-[#1d4ed8] text-white font-bold text-[15px] disabled:opacity-50 shadow-[0_8px_20px_-6px_rgba(37,99,235,.5)] transition-colors"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>

        {/* Role shortcut buttons */}
        <div className="flex gap-[9px] mt-[14px]">
          <button
            type="button"
            onClick={() => { setEmail(""); setPassword(""); }}
            className="flex-1 h-[42px] border border-[#e0e5ec] rounded-[11px] bg-white hover:bg-[#f6f8fa] text-[#374151] font-semibold text-[13.5px] transition-colors"
          >
            I&apos;m a cleaner
          </button>
          <button
            type="button"
            onClick={() => { setEmail(""); setPassword(""); }}
            className="flex-1 h-[42px] border border-[#e0e5ec] rounded-[11px] bg-white hover:bg-[#f6f8fa] text-[#374151] font-semibold text-[13.5px] transition-colors"
          >
            I&apos;m the boss
          </button>
        </div>
      </form>

      <p className="mt-[22px] text-[#9aa3af] text-[12.5px]">Carwaj · car care, organised</p>
    </div>
  );
}
