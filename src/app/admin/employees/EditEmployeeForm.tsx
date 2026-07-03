"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  const [name, setName] = useState(employee.name);
  const [whatsappNumber, setWhatsappNumber] = useState(employee.whatsapp_number ?? "");
  const [role, setRole] = useState<Role>(employee.role);
  const [selectedCommunities, setSelectedCommunities] = useState<string[]>(
    employee.community_ids ?? []
  );
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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

    const body: Record<string, unknown> = {
      name,
      whatsapp_number: whatsappNumber || null,
    };
    if (!isSelf) {
      body.role = role;
      body.community_ids = selectedCommunities;
    }
    if (newPassword) {
      body.new_password = newPassword;
    }

    const res = await fetch(`/api/admin/employees/${employee.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to save");
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

      {/* Password reset */}
      <div className="border-t border-line pt-3">
        <label className="block text-[12px] font-semibold text-gray-500 mb-1">
          New password <span className="font-normal text-gray-400">(leave blank to keep current)</span>
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Min. 6 characters"
            className="w-full rounded-lg border px-3 py-2 text-sm pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
        {newPassword && (
          <p className="mt-1 text-[11px] text-amber-600">
            The cleaner will be prompted to change this on next login.
          </p>
        )}
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
