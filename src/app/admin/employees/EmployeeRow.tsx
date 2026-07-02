"use client";

import { useState } from "react";
import EditEmployeeForm from "./EditEmployeeForm";
import type { Employee } from "@/lib/types";

interface Community {
  id: string;
  name: string;
}

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
  const [editing, setEditing] = useState(false);
  const communityNames = communities
    .filter((c) => employee.community_ids?.includes(c.id))
    .map((c) => c.name);

  if (editing) {
    return (
      <EditEmployeeForm
        employee={employee}
        communities={communities}
        isSelf={isSelf}
        onClose={() => setEditing(false)}
      />
    );
  }

  const AVATAR_COLORS = [
    { bg: "#e6efff", fg: "#2563eb" },
    { bg: "#dcf5f1", fg: "#0d9488" },
    { bg: "#fdeccf", fg: "#d97706" },
    { bg: "#ede4fd", fg: "#7c3aed" },
  ];
  const av = AVATAR_COLORS[(employee.name.charCodeAt(0) ?? 0) % AVATAR_COLORS.length];

  return (
    <tr className="hover:bg-[#fafbfc] transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <span
            className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-[12.5px] shrink-0"
            style={{ background: av.bg, color: av.fg }}
          >
            {employee.name[0]?.toUpperCase()}
          </span>
          <span className="font-bold truncate">{employee.name}</span>
        </div>
      </td>
      <td className="px-4 py-3 text-[#6b7280] truncate max-w-[160px]">{email}</td>
      <td className="px-4 py-3 text-[#4a5563] capitalize">{employee.role}</td>
      <td className="px-4 py-3 font-mono text-[12px] text-[#6b7280]">{employee.whatsapp_number}</td>
      <td className="px-4 py-3 text-[#6b7280] truncate max-w-[160px]">
        {communityNames.length > 0 ? communityNames.join(", ") : (
          <span className="text-gray-400">—</span>
        )}
      </td>
      <td className="px-4 py-3 text-right font-semibold font-mono tabular-nums">{weekCount}</td>
      <td className="px-4 py-3 text-right font-semibold font-mono tabular-nums">{monthCount}</td>
      <td className="px-4 py-3 text-right font-bold font-mono tabular-nums">AED {bookOfBusiness.toLocaleString()}</td>
      <td className="px-4 py-3">
        <button onClick={() => setEditing(true)} className="text-sm text-blue-600 font-medium">
          Edit
        </button>
      </td>
    </tr>
  );
}
