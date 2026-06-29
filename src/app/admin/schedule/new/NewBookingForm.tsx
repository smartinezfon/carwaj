"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { localDateStr } from "@/lib/date";

interface Car {
  id: string;
  make: string;
  model: string;
  color: string | null;
  plate_number: string | null;
  villa: { villa_number: string } | null;
}

interface Employee {
  id: string;
  name: string;
}

export default function NewBookingForm({
  cars,
  employees,
}: {
  cars: Car[];
  employees: Employee[];
}) {
  const router = useRouter();
  const [carId, setCarId] = useState(cars[0]?.id ?? "");
  const [employeeId, setEmployeeId] = useState("");
  const [scheduledDate, setScheduledDate] = useState(localDateStr());
  const [timeSlot, setTimeSlot] = useState("09:00 - 10:00");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        car_id: carId,
        employee_id: employeeId || undefined,
        scheduled_date: scheduledDate,
        scheduled_time_slot: timeSlot,
        notes: notes || undefined,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Failed to create job");
      setBusy(false);
      return;
    }

    router.push("/admin/schedule");
    router.refresh();
  }

  if (cars.length === 0) {
    return <p className="text-sm text-gray-500">Add a villa and car first before scheduling.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-card bg-white border border-line p-6">
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <div>
        <label className="block text-sm font-medium mb-1">Car</label>
        <select
          value={carId}
          onChange={(e) => setCarId(e.target.value)}
          className="w-full rounded-lg border px-3 py-2"
        >
          {cars.map((c) => (
            <option key={c.id} value={c.id}>
              Villa {c.villa?.villa_number} · {c.color} {c.make} {c.model}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Assign to cleaner</label>
        <select
          value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)}
          className="w-full rounded-lg border px-3 py-2"
        >
          <option value="">Unassigned</option>
          {employees.map((emp) => (
            <option key={emp.id} value={emp.id}>
              {emp.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Date</label>
        <input
          required
          type="date"
          value={scheduledDate}
          onChange={(e) => setScheduledDate(e.target.value)}
          className="w-full rounded-lg border px-3 py-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Time slot</label>
        <input
          required
          value={timeSlot}
          onChange={(e) => setTimeSlot(e.target.value)}
          className="w-full rounded-lg border px-3 py-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full rounded-lg border px-3 py-2"
        />
      </div>
      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-lg bg-blue-600 py-2.5 font-semibold text-white disabled:opacity-50"
      >
        {busy ? "Creating..." : "Create Job"}
      </button>
    </form>
  );
}
