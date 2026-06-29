"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Role } from "@/lib/types";

interface Community {
  id: string;
  name: string;
}

export default function NewEmployeeForm({ communities }: { communities: Community[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("+971");
  const [role, setRole] = useState<Role>("cleaner");
  const [selectedCommunities, setSelectedCommunities] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function toggleCommunity(id: string) {
    setSelectedCommunities((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    const res = await fetch("/api/admin/employees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        password,
        whatsapp_number: whatsappNumber,
        role,
        community_ids: selectedCommunities,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Failed to create employee");
      setBusy(false);
      return;
    }

    router.push("/admin/employees");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-card bg-white border border-line p-6">
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <div>
        <label className="block text-sm font-medium mb-1">Name</label>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border px-3 py-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Email</label>
        <input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border px-3 py-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Temporary password</label>
        <input
          required
          type="password"
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border px-3 py-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">WhatsApp number</label>
        <input
          value={whatsappNumber}
          onChange={(e) => setWhatsappNumber(e.target.value)}
          placeholder="+971xxxxxxxxx"
          className="w-full rounded-lg border px-3 py-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Role</label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as Role)}
          className="w-full rounded-lg border px-3 py-2"
        >
          <option value="cleaner">Cleaner</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Communities</label>
        <div className="space-y-1">
          {communities.map((c) => (
            <label key={c.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={selectedCommunities.includes(c.id)}
                onChange={() => toggleCommunity(c.id)}
              />
              {c.name}
            </label>
          ))}
          {communities.length === 0 && (
            <p className="text-sm text-gray-400">No communities yet</p>
          )}
        </div>
      </div>
      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-lg bg-blue-600 py-2.5 font-semibold text-white disabled:opacity-50"
      >
        {busy ? "Creating..." : "Create Employee"}
      </button>
    </form>
  );
}
