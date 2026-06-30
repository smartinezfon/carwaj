"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type CompanyStatus = "pending" | "active" | "suspended";

interface Props {
  company: {
    id: string;
    name: string;
    owner_name: string | null;
    owner_email: string | null;
    status: CompanyStatus;
  };
  admin: {
    id: string;
    name: string;
    email: string;
  } | null;
}

export default function EditCompanyForm({ company, admin }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [companyName, setCompanyName] = useState(company.name);
  const [ownerName, setOwnerName] = useState(company.owner_name ?? "");
  const [ownerEmail, setOwnerEmail] = useState(company.owner_email ?? "");
  const [status, setStatus] = useState<CompanyStatus>(company.status);
  const [adminName, setAdminName] = useState(admin?.name ?? "");
  const [adminEmail, setAdminEmail] = useState(admin?.email ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setSaved(false);

    const res = await fetch(`/api/superadmin/companies/${company.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: companyName,
        owner_name: ownerName,
        owner_email: ownerEmail,
        status,
        admin_id: admin?.id,
        admin_name: adminName,
        admin_email: adminEmail,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Failed to save");
      setBusy(false);
      return;
    }

    setSaved(true);
    setBusy(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-sm text-purple-700 font-medium hover:underline"
      >
        Edit
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4 border-t border-line pt-4">
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      {saved && <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">Saved.</p>}

      <div>
        <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">Company</p>
        <div className="space-y-2">
          <div>
            <label className="block text-xs font-medium mb-1">Company name</label>
            <input
              required
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full rounded-lg border border-line px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Owner name</label>
            <input
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              className="w-full rounded-lg border border-line px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Owner email (for reference)</label>
            <input
              type="email"
              value={ownerEmail}
              onChange={(e) => setOwnerEmail(e.target.value)}
              className="w-full rounded-lg border border-line px-3 py-2 text-sm"
            />
          </div>
        </div>
      </div>

      {admin && (
        <div>
          <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">Admin account</p>
          <div className="space-y-2">
            <div>
              <label className="block text-xs font-medium mb-1">Name</label>
              <input
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                className="w-full rounded-lg border border-line px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Login email</label>
              <input
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="w-full rounded-lg border border-line px-3 py-2 text-sm"
              />
            </div>
          </div>
        </div>
      )}

      <div className="rounded-lg border border-line px-4 py-3">
        <p className="text-sm font-medium mb-2">Account status</p>
        <div className="flex gap-2">
          {(["pending", "active", "suspended"] as CompanyStatus[]).map((s) => {
            const meta = {
              pending:   { label: "Pending",   cls: status === s ? "bg-yellow-100 text-yellow-700 border-yellow-300" : "" },
              active:    { label: "Active",    cls: status === s ? "bg-green-100 text-green-700 border-green-300"   : "" },
              suspended: { label: "Suspended", cls: status === s ? "bg-red-100 text-red-700 border-red-300"         : "" },
            }[s];
            return (
              <button
                key={s}
                type="button"
                onClick={() => setStatus(s)}
                className={`flex-1 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${
                  status === s ? meta.cls : "border-line text-muted hover:bg-canvas"
                }`}
              >
                {meta.label}
              </button>
            );
          })}
        </div>
        <p className="text-xs text-muted mt-2">
          {status === "pending" && "Waiting for admin to log in for the first time."}
          {status === "active" && "Company has full access to the app."}
          {status === "suspended" && "All access blocked — company cannot log in."}
        </p>
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={busy}
          className="rounded-lg bg-purple-700 text-white px-4 py-2 text-sm font-semibold disabled:opacity-50"
        >
          {busy ? "Saving…" : "Save changes"}
        </button>
        <button
          type="button"
          onClick={() => { setOpen(false); setSaved(false); setError(null); }}
          className="rounded-lg border border-line px-4 py-2 text-sm font-semibold text-gray-600"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
