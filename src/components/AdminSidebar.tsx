"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const LINKS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/employees", label: "Employees" },
  { href: "/admin/villas", label: "Villas & Cars" },
  { href: "/admin/schedule", label: "Schedule" },
  { href: "/admin/payments", label: "Payments" },
  { href: "/admin/communities", label: "Communities" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <aside className="w-60 shrink-0 border-r bg-white min-h-screen p-4 flex flex-col">
      <span className="text-xl font-bold mb-6">CarClean Admin</span>
      <nav className="flex-1 space-y-1">
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`block rounded-lg px-3 py-2 font-medium ${
              pathname === link.href
                ? "bg-blue-50 text-blue-700"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <button
        onClick={handleLogout}
        className="rounded-lg px-3 py-2 text-left text-gray-500 hover:bg-gray-50"
      >
        Log out
      </button>
    </aside>
  );
}
