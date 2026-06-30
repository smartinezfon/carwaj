"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function SuspendedPage() {
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center rounded-card bg-white border border-line p-10">
        <div className="h-14 w-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-5">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="#ef4444" strokeWidth="1.8" />
            <path d="M12 8v4M12 16h.01" stroke="#ef4444" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </div>
        <h1 className="text-xl font-bold mb-2">Account suspended</h1>
        <p className="text-sm text-muted mb-6">
          Your company's access to Carwaj has been suspended. Please contact support to restore access.
        </p>
        <button
          onClick={handleLogout}
          className="rounded-lg bg-gray-900 text-white px-5 py-2.5 text-sm font-semibold"
        >
          Log out
        </button>
      </div>
    </div>
  );
}
