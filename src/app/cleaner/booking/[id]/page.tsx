"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import StatusBadge from "@/components/StatusBadge";
import type { BookingWithDetails } from "@/lib/types";

export default function BookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const supabase = createClient();
  const [booking, setBooking] = useState<BookingWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const afterInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("bookings")
        .select("*, car:cars(*, villa:villas(*))")
        .eq("id", id)
        .single();
      setBooking(
        data ? ({ ...data, villa: (data as any).car.villa } as unknown as BookingWithDetails) : null
      );
      setLoading(false);
    }
    load();
  }, [id, supabase]);

  function flattenBooking(raw: any): BookingWithDetails {
    return { ...raw, villa: raw.car.villa };
  }

  async function uploadPhoto(file: File) {
    setBusy(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("bookingId", id);
    const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
    const uploadData = await uploadRes.json();

    if (uploadData.url) {
      const res = await fetch(`/api/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ after_photo_url: uploadData.url }),
      });
      const updated = await res.json();
      setBooking(flattenBooking(updated));
    }
    setBusy(false);
  }

  async function updateStatus(status: "in_progress" | "completed") {
    setBusy(true);
    const res = await fetch(`/api/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const updated = await res.json();
    setBooking(flattenBooking(updated));
    setBusy(false);
  }

  async function reschedule(scheduledDate: string, scheduledTimeSlot: string) {
    setBusy(true);
    const res = await fetch(`/api/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        scheduled_date: scheduledDate,
        scheduled_time_slot: scheduledTimeSlot,
      }),
    });
    const updated = await res.json();
    setBooking(flattenBooking(updated));
    setBusy(false);
  }

  if (loading) {
    return <div className="p-6 text-center text-gray-500">Loading...</div>;
  }

  if (!booking) {
    return <div className="p-6 text-center text-gray-500">Job not found.</div>;
  }

  return (
    <div className="space-y-4">
      <button
        onClick={() => router.back()}
        className="text-blue-600 font-medium py-2 -my-2"
      >
        ← Back
      </button>

      <div className="rounded-card bg-white p-5 shadow-sm space-y-2">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Villa {booking.villa.villa_number}</h1>
          <StatusBadge status={booking.status} />
        </div>
        <p className="text-gray-700">
          {booking.car.color} {booking.car.make} {booking.car.model}
        </p>
        {booking.car.plate_number && (
          <p className="text-gray-500 text-sm">Plate: {booking.car.plate_number}</p>
        )}
        <p className="text-gray-500 text-sm">
          {booking.scheduled_date} · {booking.scheduled_time_slot}
        </p>
        <p className="text-gray-500 text-sm">Owner: {booking.villa.owner_name}</p>
      </div>

      {booking.status === "scheduled" && (
        <RescheduleForm
          scheduledDate={booking.scheduled_date}
          scheduledTimeSlot={booking.scheduled_time_slot}
          busy={busy}
          onSave={reschedule}
        />
      )}

      {booking.status === "scheduled" && (
        <button
          disabled={busy}
          onClick={() => updateStatus("in_progress")}
          className="w-full rounded-lg bg-blue-600 py-4 text-lg font-bold text-white disabled:opacity-50"
        >
          Start Cleaning
        </button>
      )}

      {booking.status === "in_progress" && (
        <div className="rounded-card bg-white p-5 shadow-sm space-y-3">
          <h2 className="font-semibold">After photo</h2>
          {booking.after_photo_url ? (
            <img src={booking.after_photo_url} alt="After" className="rounded-lg w-full" />
          ) : (
            <p className="text-sm text-gray-400">No photo yet</p>
          )}
          <input
            ref={afterInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && uploadPhoto(e.target.files[0])}
          />
          <button
            disabled={busy}
            onClick={() => afterInputRef.current?.click()}
            className="w-full rounded-lg border-2 border-gray-300 py-3 font-semibold disabled:opacity-50"
          >
            Take After Photo
          </button>
        </div>
      )}

      {booking.status === "in_progress" && (
        <button
          disabled={busy}
          onClick={() => updateStatus("completed")}
          className="w-full rounded-lg bg-green-600 py-4 text-lg font-bold text-white disabled:opacity-50"
        >
          Mark Completed
        </button>
      )}

      {booking.status === "completed" && (
        <p className="text-center text-green-600 font-semibold py-2">
          ✅ Job completed and client notified
        </p>
      )}
    </div>
  );
}

function RescheduleForm({
  scheduledDate,
  scheduledTimeSlot,
  busy,
  onSave,
}: {
  scheduledDate: string;
  scheduledTimeSlot: string;
  busy: boolean;
  onSave: (date: string, timeSlot: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(scheduledDate);
  const [timeSlot, setTimeSlot] = useState(scheduledTimeSlot);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full rounded-lg border-2 border-gray-300 py-2.5 text-sm font-semibold text-gray-600"
      >
        Reschedule this job
      </button>
    );
  }

  return (
    <div className="rounded-card bg-white p-4 shadow-sm space-y-3">
      <h2 className="font-semibold text-sm">Reschedule</h2>
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="w-full rounded-lg border px-3 py-2.5 text-base"
      />
      <input
        type="text"
        value={timeSlot}
        onChange={(e) => setTimeSlot(e.target.value)}
        placeholder="e.g. 09:00 - 10:00"
        className="w-full rounded-lg border px-3 py-2.5 text-base"
      />
      <div className="flex gap-2">
        <button
          disabled={busy}
          onClick={() => {
            onSave(date, timeSlot);
            setOpen(false);
          }}
          className="flex-1 rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          Save
        </button>
        <button
          onClick={() => setOpen(false)}
          className="rounded-lg border px-4 py-2.5 text-sm font-medium text-gray-600"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
