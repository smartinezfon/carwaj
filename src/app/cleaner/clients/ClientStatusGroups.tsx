"use client";

import { useState } from "react";
import ClientCard from "./ClientCard";

type VillaEntry = {
  villa: any;
  employeeId: string;
  payments: any[];
  history: any[];
  today: string;
};

const STATUS_CONFIG = [
  {
    key: "active" as const,
    label: "Active",
    dot: "bg-green-500",
    badge: "bg-green-100 text-green-700",
    defaultOpen: true,
  },
  {
    key: "paused" as const,
    label: "Paused",
    dot: "bg-amber-400",
    badge: "bg-amber-100 text-amber-700",
    defaultOpen: true,
  },
  {
    key: "former" as const,
    label: "Former",
    dot: "bg-gray-300",
    badge: "bg-gray-100 text-gray-500",
    defaultOpen: false,
  },
];

function ChevronDown({ open }: { open: boolean }) {
  return (
    <svg
      width="16" height="16" viewBox="0 0 24 24" fill="none"
      className={`transition-transform duration-200 text-gray-400 ${open ? "rotate-180" : ""}`}
    >
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function StatusGroup({ config, entries }: { config: typeof STATUS_CONFIG[0]; entries: VillaEntry[] }) {
  const [open, setOpen] = useState(config.defaultOpen);

  if (entries.length === 0) return null;

  const clientWord = entries.length === 1 ? "client" : "clients";

  return (
    <div className="space-y-2">
      {/* Group header — card bubble */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full rounded-card bg-white border border-line px-4 py-3 flex items-center justify-between"
      >
        <div className="flex items-center gap-2.5">
          <span className={`w-2 h-2 rounded-full shrink-0 ${config.dot}`} />
          <span className="font-bold text-[14px]">{config.label}</span>
        </div>
        <div className="flex items-center gap-2">
          {!open && (
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${config.badge}`}>
              {entries.length} {clientWord}
            </span>
          )}
          {open && (
            <span className="text-xs text-gray-400 font-medium">
              {entries.length} {clientWord}
            </span>
          )}
          <ChevronDown open={open} />
        </div>
      </button>

      {/* Cards */}
      {open && (
        <div className="space-y-3 pl-1">
          {entries.map(({ villa, employeeId, payments, history, today }) => (
            <ClientCard
              key={villa.id}
              villa={villa}
              employeeId={employeeId}
              payments={payments}
              history={history}
              today={today}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ClientStatusGroups({ villas }: { villas: VillaEntry[] }) {
  return (
    <div className="space-y-3">
      {STATUS_CONFIG.map((config) => (
        <StatusGroup
          key={config.key}
          config={config}
          entries={villas.filter((v) => (v.villa.status ?? "active") === config.key)}
        />
      ))}
    </div>
  );
}
