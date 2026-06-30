"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewCompanyForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    const res = await fetch("/api/superadmin/companies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, owner_name: ownerName, owner_email: ownerEmail, admin_password: adminPassword }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Failed to create company");
      setBusy(false);
      return;
    }

    setName(""); setOwnerName(""); setOwnerEmail(""); setAdminPassword("");
    setBusy(false);
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-lg bg-purple-700 text-white px-4 py-2.5 text-sm font-semibold hover:bg-purple-800 transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        Add company
      </button>
    );
  }

  return (
    <div className="rounded-card bg-white border border-purple-200 p-5 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-base">New company</h2>
        <button
          onClick={() => { setOpen(false); setError(null); }}
          className="text-sm text-muted hover:text-gray-700"
        >
          Cancel
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3 max-w-md">
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <div>
          <label className="block text-sm font-medium mb-1">Company name</label>
          <input required value={name} onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-line px-3 py-2 text-sm" placeholder="e.g. CleanPro Dubai" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Owner name</label>
          <input value={ownerName} onChange={(e) => setOwnerName(e.target.value)}
            className="w-full rounded-lg border border-line px-3 py-2 text-sm" placeholder="e.g. Ahmed Al Rashid" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Admin email (their login)</label>
          <input required type="email" value={ownerEmail} onChange={(e) => setOwnerEmail(e.target.value)}
            className="w-full rounded-lg border border-line px-3 py-2 text-sm" placeholder="admin@company.com" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Temporary password</label>
          <input required type="password" minLength={8} value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)}
            className="w-full rounded-lg border border-line px-3 py-2 text-sm" />
          <p className="text-xs text-muted mt-1">They'll be asked to set their own on first login.</p>
        </div>
        <button type="submit" disabled={busy}
          className="rounded-lg bg-purple-700 text-white px-5 py-2.5 text-sm font-semibold disabled:opacity-50">
          {busy ? "Creating…" : "Create company & admin account"}
        </button>
      </form>
    </div>
  );
}
