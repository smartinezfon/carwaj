"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const LINKS = [
  {
    href: "/superadmin",
    label: "Dashboard",
    icon: (c: string) => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <rect x="4" y="4" width="7" height="7" rx="2" stroke={c} strokeWidth="1.8" />
        <rect x="13" y="4" width="7" height="7" rx="2" stroke={c} strokeWidth="1.8" />
        <rect x="4" y="13" width="7" height="7" rx="2" stroke={c} strokeWidth="1.8" />
        <rect x="13" y="13" width="7" height="7" rx="2" stroke={c} strokeWidth="1.8" />
      </svg>
    ),
  },
  {
    href: "/superadmin/companies",
    label: "Companies",
    icon: (c: string) => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="7" width="18" height="13" rx="2" stroke={c} strokeWidth="1.8" />
        <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke={c} strokeWidth="1.8" strokeLinecap="round" />
        <path d="M3 12h18" stroke={c} strokeWidth="1.8" />
      </svg>
    ),
  },
  {
    href: "/superadmin/users",
    label: "Users",
    icon: (c: string) => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <circle cx="9" cy="7" r="3" stroke={c} strokeWidth="1.8" />
        <circle cx="17" cy="8" r="2.5" stroke={c} strokeWidth="1.8" />
        <path d="M3 20c.5-3.5 3-5 6-5s5.5 1.5 6 5" stroke={c} strokeWidth="1.8" strokeLinecap="round" />
        <path d="M15 15c1.5-.3 3.5.5 4 3" stroke={c} strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/superadmin/profile",
    label: "My Profile",
    icon: (c: string) => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="8" r="3.5" stroke={c} strokeWidth="1.8" />
        <path d="M4 20c.5-4 3.5-6 8-6s7.5 2 8 6" stroke={c} strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
];

function NavLinks({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-0.5">
      {LINKS.map((link) => {
        const active = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onNavigate}
            className={`flex items-center gap-2.5 rounded-control px-2.5 py-2.5 text-sm font-semibold ${
              active ? "bg-purple-50 text-purple-700" : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            {link.icon(active ? "#7c3aed" : "#5b6573")}
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

function UserFooter({ name, onLogout }: { name: string | null; onLogout: () => void }) {
  return (
    <>
      <div className="h-px bg-line my-3.5 mx-1.5" />
      <div className="flex items-center gap-2.5 px-2 py-1.5">
        <div className="h-[34px] w-[34px] rounded-full bg-purple-700 text-white flex items-center justify-center font-bold text-sm shrink-0">
          {name?.[0] ?? "S"}
        </div>
        <div className="min-w-0">
          <div className="font-bold text-[13.5px] truncate">{name ?? "Loading…"}</div>
          <div className="text-[11.5px] text-muted">Super Admin</div>
        </div>
      </div>
      <button
        onClick={onLogout}
        className="rounded-control px-2.5 py-2 text-left text-sm text-muted hover:bg-gray-50 mt-1"
      >
        Log out
      </button>
    </>
  );
}

export default function SuperAdminSidebar({ name }: { name: string | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => { setDrawerOpen(false); }, [pathname]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-[212px] shrink-0 bg-white border border-line rounded-card p-4 sticky top-6 self-start m-6 flex-col">
        <div className="px-2 pb-3.5 text-xs font-bold text-purple-700 uppercase tracking-wide font-mono">
          Carwaj · Super Admin
        </div>
        <NavLinks pathname={pathname} />
        <UserFooter name={name} onLogout={handleLogout} />
      </aside>

      {/* Mobile top bar */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between bg-white border-b border-line px-4 h-14">
        <button
          onClick={() => setDrawerOpen(true)}
          aria-label="Open menu"
          className="p-2 rounded-control text-gray-600 hover:bg-gray-50"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
        <span className="text-sm font-bold text-purple-700 uppercase tracking-wide font-mono">Super Admin</span>
      </header>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex" onClick={() => setDrawerOpen(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <div
            className="relative w-64 bg-white h-full flex flex-col p-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-purple-700 uppercase tracking-wide font-mono">Super Admin</span>
              <button onClick={() => setDrawerOpen(false)} className="p-1.5 rounded-control text-gray-500 hover:bg-gray-50">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M6 6l12 12M6 18L18 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <NavLinks pathname={pathname} onNavigate={() => setDrawerOpen(false)} />
            <div className="flex-1" />
            <UserFooter name={name} onLogout={handleLogout} />
          </div>
        </div>
      )}
    </>
  );
}
