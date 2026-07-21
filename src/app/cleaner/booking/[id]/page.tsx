"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import StatusBadge from "@/components/StatusBadge";
import type { BookingWithDetails } from "@/lib/types";
import imageCompression from "browser-image-compression";
import { useT } from "@/lib/LanguageContext";

type UploadState =
  | { status: "idle" }
  | { status: "compressing" }
  | { status: "uploading" }
  | { status: "error"; message: string; file: File };

export default function BookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const supabase = createClient();
  const { t } = useT();
  const [booking, setBooking] = useState<BookingWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadState, setUploadState] = useState<UploadState>({ status: "idle" });
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

  async function runUpload(file: File) {
    setUploadState({ status: "compressing" });

    let compressed: File;
    try {
      compressed = await imageCompression(file, {
        maxSizeMB: 1.5,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      });
    } catch {
      compressed = file;
    }

    setUploadState({ status: "uploading" });

    try {
      const formData = new FormData();
      formData.append("file", compressed, file.name);
      formData.append("bookingId", id);
      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
      if (!uploadRes.ok) throw new Error(await uploadRes.text());
      const uploadData = await uploadRes.json();

      if (uploadData.url) {
        const res = await fetch(`/api/bookings/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ after_photo_url: uploadData.url }),
        });
        const updated = await res.json();
        setBooking(flattenBooking(updated));
        setPreviewUrl(null);
      }
      setUploadState({ status: "idle" });
    } catch (err: any) {
      setUploadState({ status: "error", message: err.message ?? "Upload failed", file });
    }
  }

  function handleFileSelect(file: File) {
    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);
    runUpload(file);
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
    return <div className="p-6 text-center text-gray-500">{t("booking_loading")}</div>;
  }

  if (!booking) {
    return <div className="p-6 text-center text-gray-500">{t("booking_not_found")}</div>;
  }

  const isUploading =
    uploadState.status === "compressing" || uploadState.status === "uploading";

  return (
    <div className="space-y-4">
      <button
        onClick={() => router.back()}
        className="text-blue-600 font-medium py-2 -my-2"
      >
        {t("booking_back")}
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
          <p className="text-gray-500 text-sm">{t("booking_plate")}: {booking.car.plate_number}</p>
        )}
        <p className="text-gray-500 text-sm">
          {booking.scheduled_date} · {booking.scheduled_time_slot}
        </p>
        <p className="text-gray-500 text-sm">{t("booking_owner")}: {booking.villa.owner_name}</p>
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
          {t("booking_start_cleaning")}
        </button>
      )}

      {booking.status === "in_progress" && (
        <div className="rounded-card bg-white p-5 shadow-sm space-y-3">
          <h2 className="font-semibold">{t("booking_after_photo")}</h2>

          {/* Photo preview: optimistic local preview while uploading, then confirmed URL */}
          {(previewUrl || booking.after_photo_url) && (
            <div className="relative">
              <img
                src={previewUrl ?? booking.after_photo_url!}
                alt="After"
                className="rounded-lg w-full"
              />
              {isUploading && (
                <div className="absolute inset-0 rounded-lg bg-black/40 flex flex-col items-center justify-center gap-2">
                  <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
                  <p className="text-white text-sm font-semibold">
                    {uploadState.status === "compressing" ? t("booking_compressing") : t("booking_uploading")}
                  </p>
                </div>
              )}
            </div>
          )}

          {!previewUrl && !booking.after_photo_url && (
            <p className="text-sm text-gray-400">{t("booking_no_photo")}</p>
          )}

          {uploadState.status === "error" && (
            <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 flex items-center justify-between">
              <span>{uploadState.message}</span>
              <button
                onClick={() => runUpload(uploadState.file)}
                className="ml-3 font-semibold underline shrink-0"
              >
                {t("booking_retry")}
              </button>
            </div>
          )}

          <input
            ref={afterInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
          />
          <button
            disabled={isUploading}
            onClick={() => afterInputRef.current?.click()}
            className="w-full rounded-lg border-2 border-gray-300 py-3 font-semibold disabled:opacity-50"
          >
            {booking.after_photo_url ? t("booking_retake_photo") : t("booking_take_photo")}
          </button>
        </div>
      )}

      {booking.status === "in_progress" && (
        <button
          disabled={busy || isUploading}
          onClick={() => updateStatus("completed")}
          className="w-full rounded-lg bg-green-600 py-4 text-lg font-bold text-white disabled:opacity-50"
        >
          {t("booking_mark_completed")}
        </button>
      )}

      {booking.status === "completed" && (
        <p className="text-center text-green-600 font-semibold py-2">
          {t("booking_job_completed")}
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
  const { t } = useT();

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full rounded-lg border-2 border-gray-300 py-2.5 text-sm font-semibold text-gray-600"
      >
        {t("booking_reschedule")}
      </button>
    );
  }

  return (
    <div className="rounded-card bg-white p-4 shadow-sm space-y-3">
      <h2 className="font-semibold text-sm">{t("booking_reschedule_title")}</h2>
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
        placeholder={t("booking_time_placeholder")}
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
          {t("booking_save")}
        </button>
        <button
          onClick={() => setOpen(false)}
          className="rounded-lg border px-4 py-2.5 text-sm font-medium text-gray-600"
        >
          {t("booking_cancel")}
        </button>
      </div>
    </div>
  );
}
