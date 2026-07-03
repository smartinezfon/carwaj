"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const ROLE_STYLE: Record<string, string> = {
  admin:   "bg-blue-100 text-blue-700",
  cleaner: "bg-green-100 text-green-700",
};

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export interface UserData {
  id: string;
  name: string;
  role: string;
  email: string;
  communities: { id: string; name: string }[];
  villas: number;
  cars: number;
  bookOfBusiness: number;
  schedules: { villa: string; days: number[]; price: number }[];
}

export interface CompanyData {
  id: string;
  name: string;
  status: string;
  users: UserData[];
}

function EditUserPanel({ user, onClose }: { user: UserData; onClose: () => void }) {
  const router = useRouter();
  const [name, setName] = useState(user.name);
  const [whatsapp, setWhatsapp] = useState("");
  const [role, setRole] = useState(user.role);
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    const body: Record<string, unknown> = { name, role };
    if (whatsapp) body.whatsapp_number = whatsapp;
    if (newPassword) body.new_password = newPassword;

    const res = await fetch(`/api/superadmin/employees/${user.id}`, {
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
    <form onSubmit={handleSave} className="mt-3 border-t border-line pt-3 space-y-3">
      {error && <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] font-semibold text-gray-500 mb-1">Name</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-gray-500 mb-1">Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full rounded-lg border px-3 py-2 text-sm"
          >
            <option value="cleaner">Cleaner</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-[11px] font-semibold text-gray-500 mb-1">
          WhatsApp <span className="font-normal text-gray-400">(leave blank to keep current)</span>
        </label>
        <input
          value={whatsapp}
          onChange={(e) => setWhatsapp(e.target.value)}
          placeholder="+971xxxxxxxxx"
          className="w-full rounded-lg border px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-[11px] font-semibold text-gray-500 mb-1">
          New password <span className="font-normal text-gray-400">(leave blank to keep current)</span>
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Min. 6 characters"
            className="w-full rounded-lg border px-3 py-2 text-sm pr-14"
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
        {newPassword && (
          <p className="mt-1 text-[11px] text-amber-600">
            The user will be prompted to change this on next login.
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

export default function UserCompanyAccordion({ companies }: { companies: CompanyData[] }) {
  const [openIds, setOpenIds] = useState<Set<string>>(new Set(companies.map((c) => c.id)));
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  function toggle(id: string) {
    setOpenIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  return (
    <div className="space-y-4">
      {companies.map((company) => {
        const isOpen = openIds.has(company.id);
        return (
          <div key={company.id} className="rounded-card bg-white border border-line overflow-hidden">
            {/* Clickable header */}
            <button
              onClick={() => toggle(company.id)}
              className="w-full flex items-center justify-between px-5 py-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <svg
                  width="16" height="16" viewBox="0 0 24 24" fill="none"
                  className={`transition-transform duration-200 text-gray-400 shrink-0 ${isOpen ? "rotate-90" : ""}`}
                >
                  <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div>
                  <p className="font-bold text-sm">{company.name}</p>
                  <p className="text-xs text-muted">{company.users.length} user{company.users.length !== 1 ? "s" : ""}</p>
                </div>
              </div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                company.status === "active"  ? "bg-green-100 text-green-700"   :
                company.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                                               "bg-red-100 text-red-700"
              }`}>
                {company.status === "active" ? "Active" : company.status === "pending" ? "Pending" : "Suspended"}
              </span>
            </button>

            {/* Collapsible user list */}
            {isOpen && (
              <div className="divide-y divide-line">
                {company.users.map((emp) => {
                  const isEditing = editingUserId === emp.id;
                  return (
                    <div key={emp.id} className="p-5">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center font-bold text-sm text-gray-600 shrink-0">
                            {emp.name?.[0] ?? "?"}
                          </div>
                          <div>
                            <p className="font-semibold text-sm">{emp.name}</p>
                            {emp.email && <p className="text-xs text-muted">{emp.email}</p>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${ROLE_STYLE[emp.role] ?? "bg-gray-100 text-gray-600"}`}>
                            {emp.role}
                          </span>
                          <button
                            onClick={() => setEditingUserId(isEditing ? null : emp.id)}
                            className="text-xs font-semibold text-blue-600 border border-blue-200 rounded-lg px-2.5 py-1 hover:bg-blue-50 transition-colors"
                          >
                            {isEditing ? "Cancel" : "Edit"}
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                        {[
                          { label: "Communities", val: emp.communities.length },
                          { label: "Villas",      val: emp.villas },
                          { label: "Cars",        val: emp.cars },
                          { label: "Book of business", val: emp.bookOfBusiness > 0 ? `AED ${emp.bookOfBusiness.toLocaleString()}` : "—" },
                        ].map((s) => (
                          <div key={s.label} className="bg-canvas rounded-control px-3 py-2">
                            <p className="text-xs text-muted">{s.label}</p>
                            <p className="font-bold text-sm">{s.val}</p>
                          </div>
                        ))}
                      </div>

                      {emp.communities.length > 0 && (
                        <div className="mb-2">
                          <p className="text-xs text-muted font-semibold uppercase tracking-wide mb-1.5">Communities</p>
                          <div className="flex flex-wrap gap-1.5">
                            {emp.communities.map((c) => (
                              <span key={c.id} className="text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full">
                                {c.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {emp.schedules.length > 0 && (
                        <div>
                          <p className="text-xs text-muted font-semibold uppercase tracking-wide mb-1.5">Active schedules</p>
                          <div className="flex flex-wrap gap-1.5">
                            {emp.schedules.map((s, i) => (
                              <span key={i} className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full">
                                Villa {s.villa} · {s.days.map((d) => WEEKDAY_LABELS[d]).join("/")} · AED {s.price}/mo
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {emp.role === "admin" && emp.communities.length === 0 && (
                        <p className="text-xs text-muted italic">Manages all communities in this company</p>
                      )}

                      {isEditing && (
                        <EditUserPanel
                          user={emp}
                          onClose={() => setEditingUserId(null)}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
