"use client";

import { useState } from "react";
import BookingCard from "./BookingCard";

export type GroupedBooking = {
  id: string;
  status: string;
  scheduled_time_slot: string;
  car: { id: string; make: string; model: string; color: string; plate_number?: string };
  villa: { villa_number: string; owner_name: string; community?: { name: string } | null };
};

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

export function VillaGroup({ villaNumber, bookings }: { villaNumber: string; bookings: GroupedBooking[] }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="rounded-xl border border-line bg-white overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <span className="font-semibold text-sm">Villa {villaNumber}</span>
        <div className="flex items-center gap-2">
          {!open && (
            <span className="text-xs text-gray-400">{bookings.length} car{bookings.length !== 1 ? "s" : ""}</span>
          )}
          <ChevronDown open={open} />
        </div>
      </button>
      {open && (
        <div className="border-t border-line divide-y divide-line">
          {bookings.map((b) => (
            <div key={b.id} className="px-3 py-2">
              <BookingCard booking={b as any} hideVilla />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function CommunityGroup({ name, bookings }: { name: string; bookings: GroupedBooking[] }) {
  const [open, setOpen] = useState(true);

  const villaNumbers = [...new Set(bookings.map((b) => b.villa.villa_number))];
  const byVilla = villaNumbers.reduce<Record<string, GroupedBooking[]>>((acc, v) => {
    acc[v] = bookings.filter((b) => b.villa.villa_number === v);
    return acc;
  }, {});

  const summary = `${villaNumbers.length} villa${villaNumbers.length !== 1 ? "s" : ""} · ${bookings.length} car${bookings.length !== 1 ? "s" : ""}`;

  return (
    <div className="space-y-2">
      {/* Card-bubble header */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full rounded-card bg-white border border-line px-4 py-3 flex items-center justify-between"
      >
        <h2 className="text-[13px] font-bold text-gray-700">{name}</h2>
        <div className="flex items-center gap-2">
          {!open && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-500">
              {summary}
            </span>
          )}
          {open && (
            <span className="text-xs text-gray-400 font-medium">{summary}</span>
          )}
          <ChevronDown open={open} />
        </div>
      </button>
      {open && (
        <div className="space-y-2 pl-1">
          {Object.entries(byVilla).map(([villaNumber, villaBookings]) => (
            <VillaGroup key={villaNumber} villaNumber={villaNumber} bookings={villaBookings} />
          ))}
        </div>
      )}
    </div>
  );
}

export function groupByCommunity(bookings: GroupedBooking[]) {
  const communities = [...new Set(bookings.map((b) => b.villa.community?.name ?? "Unassigned"))];
  return communities.reduce<Record<string, GroupedBooking[]>>((acc, c) => {
    acc[c] = bookings.filter((b) => (b.villa.community?.name ?? "Unassigned") === c);
    return acc;
  }, {});
}
