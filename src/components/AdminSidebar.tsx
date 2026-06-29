"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const ICONS: Record<string, (c: string) => React.ReactNode> = {
  overview: (c) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="4" width="7" height="7" rx="2" stroke={c} strokeWidth="1.8" />
      <rect x="13" y="4" width="7" height="7" rx="2" stroke={c} strokeWidth="1.8" />
      <rect x="4" y="13" width="7" height="7" rx="2" stroke={c} strokeWidth="1.8" />
      <rect x="13" y="13" width="7" height="7" rx="2" stroke={c} strokeWidth="1.8" />
    </svg>
  ),
  communities: (c) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 21s-7-6.1-7-11.2A7 7 0 0 1 19 9.8C19 14.9 12 21 12 21z"
        stroke={c}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="9.5" r="2.4" stroke={c} strokeWidth="1.8" />
    </svg>
  ),
  villas: (c) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M4 11.5L12 5l8 6.5" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 10.5V19h12v-8.5" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  employees: (c) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="9" cy="8" r="3.2" stroke={c} strokeWidth="1.8" />
      <path d="M3.5 19c.5-3 2.8-4.6 5.5-4.6s5 1.6 5.5 4.6" stroke={c} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M16 5.5a3 3 0 0 1 0 5.6M17 19c-.2-2-1-3.4-2.2-4.3" stroke={c} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ),
  payments: (c) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="6" width="18" height="12" rx="3" stroke={c} strokeWidth="1.8" />
      <path d="M3 10h18" stroke={c} strokeWidth="1.8" />
    </svg>
  ),
};

const LINKS = [
  { href: "/admin", label: "Overview", icon: "overview" },
  { href: "/admin/communities", label: "Communities", icon: "communities" },
  { href: "/admin/villas", label: "Villas", icon: "villas" },
  { href: "/admin/employees", label: "Employees", icon: "employees" },
  { href: "/admin/payments", label: "Payments", icon: "payments" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      const { data: employee } = await supabase
        .from("employees")
        .select("name")
        .eq("auth_user_id", data.user.id)
        .single();
      setName(employee?.name ?? null);
    });
  }, [supabase]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <aside className="w-[212px] shrink-0 bg-white border border-line rounded-card p-4 sticky top-6 self-start m-6 flex flex-col">
      <div className="px-2 pb-3.5 text-xs font-bold text-muted uppercase tracking-wide font-mono">
        Carwaj Admin
      </div>
      <nav className="flex flex-col gap-0.5">
        {LINKS.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-2.5 rounded-control px-2.5 py-2.5 text-sm font-semibold ${
                active ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {ICONS[link.icon](active ? "#2563eb" : "#5b6573")}
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="h-px bg-line my-3.5 mx-1.5" />
      <div className="flex items-center gap-2.5 px-2 py-1.5">
        <div className="h-[34px] w-[34px] rounded-full bg-ink text-white flex items-center justify-center font-bold text-sm shrink-0">
          {name?.[0] ?? "?"}
        </div>
        <div className="min-w-0">
          <div className="font-bold text-[13.5px] truncate">{name ?? "Loading…"}</div>
          <div className="text-[11.5px] text-muted">Owner</div>
        </div>
      </div>
      <button
        onClick={handleLogout}
        className="rounded-control px-2.5 py-2 text-left text-sm text-muted hover:bg-gray-50 mt-1"
      >
        Log out
      </button>
    </aside>
  );
}
