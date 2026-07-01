"use client";

import { useState } from "react";
import { CommunityGroup, groupByCommunity, type GroupedBooking } from "@/components/BookingGroups";

function ordinal(n: number) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function formatDate(dateStr: string) {
  const d = new Date(`${dateStr}T00:00:00`);
  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  return `${ordinal(d.getDate())} of ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function ChevronDown({ open }: { open: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Section({
  title,
  bookings,
  defaultOpen,
  variant = "default",
}: {
  title: string;
  bookings: GroupedBooking[];
  defaultOpen: boolean;
  variant?: "default" | "completed";
}) {
  const [open, setOpen] = useState(defaultOpen);

  const villaCount = new Set(bookings.map((b) => b.villa.villa_number)).size;
  const communityCount = new Set(bookings.map((b) => b.villa.community?.name ?? "Unassigned")).size;
  const summary = [
    `${bookings.length} car${bookings.length !== 1 ? "s" : ""}`,
    `${villaCount} villa${villaCount !== 1 ? "s" : ""}`,
    communityCount > 1 ? `${communityCount} communities` : null,
  ].filter(Boolean).join(" · ");

  const byCommunity = groupByCommunity(bookings);

  const isCompleted = variant === "completed";

  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between mb-3"
      >
        <span className={`text-sm font-bold ${isCompleted ? "text-green-600" : "text-gray-700"}`}>
          {title}
        </span>
        <div className={`flex items-center gap-2 ${isCompleted ? "text-green-500" : "text-gray-400"}`}>
          {!open && (
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
              isCompleted ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
            }`}>
              {summary}
            </span>
          )}
          <ChevronDown open={open} />
        </div>
      </button>

      {open && (
        <div className="space-y-4">
          {Object.entries(byCommunity).map(([community, communityBookings]) => (
            <CommunityGroup key={community} name={community} bookings={communityBookings} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function TodayClient({
  bookings,
  today,
}: {
  bookings: GroupedBooking[];
  today: string;
}) {
  const pending = bookings.filter((b) => b.status !== "completed");
  const completed = bookings.filter((b) => b.status === "completed");

  return (
    <div className="space-y-5">
      {/* Progress header */}
      <div className="rounded-card bg-white p-4 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{formatDate(today)}</p>
          <p className="text-2xl font-bold mt-0.5">
            <span className="text-green-600">{completed.length}</span>
            <span className="text-gray-300"> / </span>
            <span>{bookings.length}</span>
          </p>
        </div>
        {bookings.length > 0 && completed.length === bookings.length && (
          <span className="rounded-full bg-green-100 px-3 py-1.5 text-sm font-semibold text-green-700">
            All done 🎉
          </span>
        )}
      </div>

      {bookings.length === 0 && (
        <p className="text-center text-gray-500 py-10">No jobs scheduled for today.</p>
      )}

      {pending.length > 0 && (
        <Section
          title={`To do (${pending.length})`}
          bookings={pending}
          defaultOpen
        />
      )}

      {completed.length > 0 && (
        <Section
          title={`Completed (${completed.length})`}
          bookings={completed}
          defaultOpen={false}
          variant="completed"
        />
      )}
    </div>
  );
}
