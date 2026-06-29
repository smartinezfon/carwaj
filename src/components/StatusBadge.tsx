import type { BookingStatus } from "@/lib/types";

const META: Record<BookingStatus, { label: string; text: string; bg: string; dot: string }> = {
  scheduled: { label: "Scheduled", text: "#b45309", bg: "#fff4e5", dot: "#f59e0b" },
  in_progress: { label: "In progress", text: "#1d4ed8", bg: "#e8f0fe", dot: "#2563eb" },
  completed: { label: "Completed", text: "#15803d", bg: "#e7f7ee", dot: "#16a34a" },
  cancelled: { label: "Cancelled", text: "#b91c1c", bg: "#fdecec", dot: "#ef4444" },
};

export default function StatusBadge({ status }: { status: BookingStatus }) {
  const m = META[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-pill px-3 py-1 text-xs font-bold"
      style={{ color: m.text, backgroundColor: m.bg }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: m.dot }} />
      {m.label}
    </span>
  );
}
