"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useT } from "@/lib/LanguageContext";

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
  const supabase = createClient();
  const [initial, setInitial] = useState<string>("?");

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      const { data: emp } = await supabase
        .from("employees")
        .select("name")
        .eq("auth_user_id", data.user.id)
        .single();
      if (emp?.name) setInitial(emp.name[0].toUpperCase());
    });
  }, [supabase]);

  const { t } = useT();
  const tabs = [
    { href: "/cleaner", label: t("nav_today"), icon: "today" },
    { href: "/cleaner/calendar", label: t("nav_calendar"), icon: "calendar" },
    { href: "/cleaner/clients", label: t("nav_clients"), icon: "clients" },
    { href: "/cleaner/payments", label: t("nav_payments"), icon: "history" },
  ];

  return (
    <>
      <header className="sticky top-0 z-10 bg-white/85 backdrop-blur-md border-b border-line">
        <div className="flex items-center justify-between px-[18px] py-3">
          <div className="flex items-center gap-[9px]">
            <div className="h-7 w-7 rounded-[9px] bg-blue-600 flex items-center justify-center shadow-[0_4px_12px_-3px_rgba(37,99,235,.55)]">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                <path d="M3.6 15.2l1.5-3.9A2.5 2.5 0 0 1 7.4 9.6h7.2a2.5 2.5 0 0 1 2.3 1.6l1.5 3.9" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3 15.2h16v2a1 1 0 0 1-1 1h-.3a1 1 0 0 1-1-1v-.2H5.3v.2a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-2z" stroke="#fff" strokeWidth="1.7" strokeLinejoin="round"/>
                <circle cx="7.3" cy="16.1" r="1.3" fill="#2563eb" stroke="#fff" strokeWidth="1.2"/>
                <circle cx="14.7" cy="16.1" r="1.3" fill="#2563eb" stroke="#fff" strokeWidth="1.2"/>
                <path d="M19.4 4.2C19.6 5.9 20.1 6.4 21.8 6.6C20.1 6.8 19.6 7.3 19.4 9C19.2 7.3 18.7 6.8 17 6.6C18.7 6.4 19.2 5.9 19.4 4.2Z" fill="#fff"/>
              </svg>
            </div>
            <span className="text-[17px] font-extrabold tracking-[-0.025em]">Carwaj</span>
          </div>
          {/* Avatar → profile */}
          <Link
            href="/cleaner/profile"
            data-guide="profile"
            className="w-8 h-8 rounded-full bg-[#dfe7f5] text-blue-600 flex items-center justify-center font-extrabold text-sm select-none"
          >
            {initial}
          </Link>
        </div>
      </header>

      <nav className="fixed bottom-0 left-0 right-0 z-10 mx-auto max-w-md bg-white/90 backdrop-blur-md border-t border-[#e9edf2] flex pb-[max(env(safe-area-inset-bottom),10px)] pt-2">
        {tabs.map((tab) => {
          const active = pathname === tab.href;
          const color = active ? BLUE : GREY;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              data-guide={tab.icon}
              className="flex-1 flex flex-col items-center gap-[3px] py-1 min-h-11"
            >
              {ICONS[tab.icon](color)}
              <span className="text-[10.5px] font-semibold" style={{ color }}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
