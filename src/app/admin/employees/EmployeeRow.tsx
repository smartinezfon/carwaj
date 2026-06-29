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

  return (
    <tr>
      <td className="px-4 py-3 font-medium">{employee.name}</td>
      <td className="px-4 py-3 text-gray-600">{email}</td>
      <td className="px-4 py-3 capitalize">{employee.role}</td>
      <td className="px-4 py-3">{employee.whatsapp_number}</td>
      <td className="px-4 py-3">
        {communityNames.length > 0 ? communityNames.join(", ") : (
          <span className="text-gray-400">None</span>
        )}
      </td>
      <td className="px-4 py-3">{weekCount}</td>
      <td className="px-4 py-3">{monthCount}</td>
      <td className="px-4 py-3">AED {bookOfBusiness.toLocaleString()}</td>
      <td className="px-4 py-3">
        <button onClick={() => setEditing(true)} className="text-sm text-blue-600 font-medium">
          Edit
        </button>
      </td>
    </tr>
  );
}
