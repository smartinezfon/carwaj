"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function CleanerNav() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  const tabs = [
    { href: "/cleaner", label: "Today" },
    { href: "/cleaner/week", label: "Week" },
  ];

  return (
    <header className="sticky top-0 z-10 bg-white border-b">
      <div className="flex items-center justify-between px-4 py-3">
        <span className="text-xl font-bold">CarClean</span>
        <button onClick={handleLogout} className="text-sm text-gray-500">
          Log out
        </button>
      </div>
      <nav className="flex">
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex-1 py-3 text-center text-base font-semibold ${
              pathname === tab.href
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
