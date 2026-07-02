"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Employee, Role } from "@/lib/types";

interface Community {
  id: string;
  name: string;
}

export default function EditEmployeeForm({
  employee,
  communities,
  isSelf,
  onClose,
}: {
  employee: Employee;
  communities: Community[];
  isSelf: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [name, setName] = useState(employee.name);
  const [whatsappNumber, setWhatsappNumber] = useState(employee.whatsapp_number ?? "");
  const [role, setRole] = useState<Role>(employee.role);
  const [selectedCommunities, setSelectedCommunities] = useState<string[]>(
    employee.community_ids ?? []
  );
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function toggleCommunity(id: string) {
    setSelectedCommunities((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    const updates: Record<string, unknown> = {
      name,
      whatsapp_number: whatsappNumber || null,
    };
    if (!isSelf) {
      updates.role = role;
      updates.community_ids = selectedCommunities;
    }

    const { error: updateError } = await supabase
      .from("employees")
      .update(updates)
      .eq("id", employee.id);

    if (updateError) {
      setError(updateError.message);
      setBusy(false);
      return;
    }
    setBusy(false);
    onClose();
    router.refresh();
  }

  return (
    <form onSubmit={handleSave} className="space-y-3 pt-1">
      {error && (
        <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[12px] font-semibold text-gray-500 mb-1">Name</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-[12px] font-semibold text-gray-500 mb-1">WhatsApp</label>
          <input
            value={whatsappNumber}
            onChange={(e) => setWhatsappNumber(e.target.value)}
            className="w-full rounded-lg border px-3 py-2 text-sm"
          />
        </div>
      </div>
      {isSelf && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
          You can't change your own role or community assignments here — ask another admin.
        </p>
      )}
      <div>
        <label className="block text-[12px] font-semibold text-gray-500 mb-1">Role</label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as Role)}
          disabled={isSelf}
          className="w-full rounded-lg border px-3 py-2 text-sm disabled:bg-gray-100 disabled:text-gray-400"
        >
          <option value="cleaner">Cleaner</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      <div>
        <label className="block text-[12px] font-semibold text-gray-500 mb-1">Communities</label>
        <div className="flex flex-wrap gap-3">
          {communities.map((c) => (
            <label
              key={c.id}
              className={`flex items-center gap-1.5 text-sm ${isSelf ? "text-gray-400" : ""}`}
            >
              <input
                type="checkbox"
                checked={selectedCommunities.includes(c.id)}
                onChange={() => toggleCommunity(c.id)}
                disabled={isSelf}
              />
              {c.name}
            </label>
          ))}
          {communities.length === 0 && (
            <p className="text-sm text-gray-400">No communities yet</p>
          )}
        </div>
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={busy}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {busy ? "Saving..." : "Save"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border px-4 py-2 text-sm font-medium text-gray-600"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
