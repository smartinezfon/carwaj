import Link from "next/link";
import StatusBadge from "./StatusBadge";
import type { BookingWithDetails } from "@/lib/types";

export default function BookingCard({ booking }: { booking: BookingWithDetails }) {
  return (
    <Link
      href={`/cleaner/booking/${booking.id}`}
      className="block rounded-xl border bg-white p-4 shadow-sm active:scale-[0.99] transition"
    >
      <div className="flex items-center justify-between">
        <span className="text-lg font-bold">Villa {booking.villa.villa_number}</span>
        <StatusBadge status={booking.status} />
      </div>
      <p className="mt-1 text-gray-700">
        {booking.car.color} {booking.car.make} {booking.car.model}
        {booking.car.plate_number ? ` · ${booking.car.plate_number}` : ""}
      </p>
      <p className="mt-1 text-sm text-gray-500">{booking.scheduled_time_slot}</p>
    </Link>
  );
}
