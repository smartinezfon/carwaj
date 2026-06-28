"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface Employee {
  id: string;
  name: string;
}

export default function AssignEmployeeSelect({
  bookingId,
  currentEmployeeId,
  employees,
}: {
  bookingId: string;
  currentEmployeeId: string | null;
  employees: Employee[];
}) {
  const router = useRouter();
  const supabase = createClient();

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const employeeId = e.target.value || null;
    await supabase.from("bookings").update({ employee_id: employeeId }).eq("id", bookingId);
    router.refresh();
  }

  return (
    <select
      defaultValue={currentEmployeeId ?? ""}
      onChange={handleChange}
      className="w-full rounded border px-1 py-0.5 text-xs"
    >
      <option value="">Unassigned</option>
      {employees.map((emp) => (
        <option key={emp.id} value={emp.id}>
          {emp.name}
        </option>
      ))}
    </select>
  );
}
