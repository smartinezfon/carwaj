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
    <div className="space-y-2">
      {/* Card-bubble header */}
      <button
        onClick={() => setOpen((o) => !o)}
        className={`w-full rounded-card bg-white border px-4 py-3 flex items-center justify-between ${
          isCompleted ? "border-green-200" : "border-line"
        }`}
      >
        <div className="flex items-center gap-2.5">
          <span className={`w-2 h-2 rounded-full shrink-0 ${isCompleted ? "bg-green-500" : "bg-blue-500"}`} />
          <span className={`font-bold text-[14px] ${isCompleted ? "text-green-700" : "text-gray-700"}`}>
            {title}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {!open && (
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
              isCompleted ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
            }`}>
              {summary}
            </span>
          )}
          {open && (
            <span className={`text-xs font-medium ${isCompleted ? "text-green-500" : "text-gray-400"}`}>
              {summary}
            </span>
          )}
          <ChevronDown open={open} />
        </div>
      </button>

      {open && (
        <div className="space-y-4 pl-1">
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
      <div className="rounded-[20px] bg-white border border-[#e6eaef] p-4 flex items-center justify-between shadow-[0_1px_2px_rgba(15,23,42,.05)]">
        <div>
          <p className="text-[13px] text-[#7b8696]">{formatDate(today)}</p>
          <p className="text-[26px] font-extrabold tracking-[-0.03em] mt-0.5 tabular-nums">
            <span className="text-green-600">{completed.length}</span>
            <span className="text-[#cbd2db]"> / </span>
            <span>{bookings.length}</span>
          </p>
        </div>
        {/* Donut */}
        {bookings.length > 0 && (
          <div
            className="w-[58px] h-[58px] rounded-full flex items-center justify-center shrink-0"
            style={{
              background: `conic-gradient(#16a34a ${Math.round(completed.length / bookings.length * 100) * 3.6}deg, #e6eaef 0)`,
            }}
          >
            <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center text-[13px] font-extrabold text-green-600 tabular-nums">
              {Math.round(completed.length / bookings.length * 100)}%
            </div>
          </div>
        )}
        {bookings.length === 0 && (
          <span className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-400">
            No jobs
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
