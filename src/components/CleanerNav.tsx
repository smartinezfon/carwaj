"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const ICONS: Record<string, (color: string) => React.ReactNode> = {
  today: (c) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="8.5" stroke={c} strokeWidth="1.9" />
      <path d="M12 7.5V12l3 2" stroke={c} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  calendar: (c) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="5.5" width="16" height="15" rx="3" stroke={c} strokeWidth="1.9" />
      <path d="M4 10h16M8.5 3.5v4M15.5 3.5v4" stroke={c} strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  ),
  clients: (c) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M4 11.5L12 5l8 6.5" stroke={c} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 10.5V19h12v-8.5" stroke={c} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  history: (c) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="6" width="18" height="12" rx="3" stroke={c} strokeWidth="1.9" />
      <path d="M3 10h18" stroke={c} strokeWidth="1.9" />
      <circle cx="17" cy="14" r="1.3" fill={c} />
    </svg>
  ),
  profile: (c) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8.2" r="3.4" stroke={c} strokeWidth="1.9" />
      <path d="M4.8 19.5c.6-3.4 3.1-5.3 7.2-5.3s6.6 1.9 7.2 5.3" stroke={c} strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  ),
};

const BLUE = "#2563eb";
const GREY = "#9aa3af";

export default function CleanerNav() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  const tabs = [
    { href: "/cleaner", label: "Today", icon: "today" },
    { href: "/cleaner/calendar", label: "Calendar", icon: "calendar" },
    { href: "/cleaner/clients", label: "Clients", icon: "clients" },
    { href: "/cleaner/payments", label: "Payments", icon: "history" },
    { href: "/cleaner/profile", label: "Profile", icon: "profile" },
  ];

  return (
    <>
      <header className="sticky top-0 z-10 bg-white/85 backdrop-blur-md border-b border-line">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-[9px] bg-blue-600 flex items-center justify-center shadow-[0_2px_8px_rgba(37,99,235,.35)]">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
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
            <span className="text-lg font-extrabold tracking-tight">Carwaj</span>
          </div>
        </div>
      </header>

      <nav className="fixed bottom-0 left-0 right-0 z-10 mx-auto max-w-md bg-white/90 backdrop-blur-md border-t border-line flex pb-[max(env(safe-area-inset-bottom),10px)] pt-2">
        {tabs.map((tab) => {
          const active = pathname === tab.href;
          const color = active ? BLUE : GREY;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex-1 flex flex-col items-center gap-1 py-1 min-h-11"
            >
              {ICONS[tab.icon](color)}
              <span className="text-[11px] font-semibold" style={{ color }}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
