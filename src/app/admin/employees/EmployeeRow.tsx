"use client";

import { useState } from "react";
import EditEmployeeForm from "./EditEmployeeForm";
import type { Employee } from "@/lib/types";

interface Community {
  id: string;
  name: string;
}

const AVATAR_COLORS = [
  { bg: "#e6efff", fg: "#2563eb" },
  { bg: "#dcf5f1", fg: "#0d9488" },
  { bg: "#fdeccf", fg: "#d97706" },
  { bg: "#ede4fd", fg: "#7c3aed" },
];

const ROLE_STYLES: Record<string, string> = {
  admin: "bg-[#e6efff] text-[#2563eb]",
  super_admin: "bg-[#ede4fd] text-[#7c3aed]",
  cleaner: "bg-[#dcf5f1] text-[#0d9488]",
};

export default function EmployeeRow({
  employee,
  email,
  communities,
  weekCount,
  monthCount,
  bookOfBusiness,
  isSelf,
}: {
  employee: Employee;
  email: string;
  communities: Community[];
  weekCount: number;
  monthCount: number;
  bookOfBusiness: number;
  isSelf: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);

  const av = AVATAR_COLORS[(employee.name.charCodeAt(0) ?? 0) % AVATAR_COLORS.length];
  const communityNames = communities
    .filter((c) => employee.community_ids?.includes(c.id))
    .map((c) => c.name);
  const roleStyle = ROLE_STYLES[employee.role as string] ?? "bg-gray-100 text-gray-600";
  const roleLabel = (employee.role as string) === "super_admin" ? "Super admin" : employee.role.charAt(0).toUpperCase() + employee.role.slice(1);

  return (
    <div className="rounded-card bg-white border border-line overflow-hidden">
      {/* Collapsed row */}
      <button
        onClick={() => { setExpanded((e) => !e); setEditing(false); }}
        className="w-full text-left px-4 py-3.5 flex items-center gap-3"
      >
        {/* Avatar */}
        <span
          className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-[13px] shrink-0"
          style={{ background: av.bg, color: av.fg }}
        >
          {employee.name[0]?.toUpperCase()}
        </span>

        {/* Name + email */}
        <div className="min-w-0 flex-1">
          <p className="font-bold text-[14px] leading-tight truncate">
            {employee.name}
            {isSelf && <span className="ml-1.5 text-[11px] font-normal text-gray-400">(you)</span>}
          </p>
          <p className="text-[12px] text-gray-400 truncate">{email}</p>
        </div>

        {/* Role pill */}
        <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${roleStyle}`}>
          {roleLabel}
        </span>

        {/* Chevron */}
        <span className={`text-gray-400 transition-transform shrink-0 ${expanded ? "rotate-180" : ""}`}>▾</span>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-line px-4 py-3 space-y-3">
          {/* Stats row */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg bg-[#fafbfc] border border-line px-3 py-2 text-center">
              <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wide">This week</p>
              <p className="text-[18px] font-extrabold tabular-nums">{weekCount}</p>
            </div>
            <div className="rounded-lg bg-[#fafbfc] border border-line px-3 py-2 text-center">
              <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wide">This month</p>
              <p className="text-[18px] font-extrabold tabular-nums">{monthCount}</p>
            </div>
            <div className="rounded-lg bg-[#fafbfc] border border-line px-3 py-2 text-center">
              <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wide">Book</p>
              <p className="text-[15px] font-extrabold tabular-nums">AED {bookOfBusiness.toLocaleString()}</p>
            </div>
          </div>

          {/* Detail rows */}
          <div className="space-y-1.5 text-[13px]">
            <div className="flex gap-2">
              <span className="text-gray-400 w-24 shrink-0">WhatsApp</span>
              <span className="font-mono text-gray-700">{employee.whatsapp_number || "—"}</span>
            </div>
            <div className="flex gap-2">
              <span className="text-gray-400 w-24 shrink-0">Communities</span>
              <span className="text-gray-700">
                {communityNames.length > 0 ? communityNames.join(", ") : <span className="text-gray-400">—</span>}
              </span>
            </div>
          </div>

          {/* Edit button / form */}
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="text-sm text-blue-600 font-semibold"
            >
              Edit
            </button>
          ) : (
            <EditEmployeeForm
              employee={employee}
              communities={communities}
              isSelf={isSelf}
              onClose={() => setEditing(false)}
            />
          )}
        </div>
      )}
    </div>
  );
}
