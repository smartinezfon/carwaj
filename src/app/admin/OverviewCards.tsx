"use client";

import { useState } from "react";

function Card({
  icon,
  iconBg,
  iconFg,
  label,
  value,
  expanded,
  onToggle,
  children,
}: {
  icon: string;
  iconBg: string;
  iconFg: string;
  label: string;
  value: string | number;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`self-start rounded-card bg-white border border-line overflow-hidden transition-shadow ${
        expanded ? "shadow-md ring-1 ring-blue-100" : ""
      }`}
    >
      <button onClick={onToggle} className="w-full text-left p-[18px]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className="h-[30px] w-[30px] rounded-[9px] flex items-center justify-center font-extrabold text-sm font-mono"
              style={{ backgroundColor: iconBg, color: iconFg }}
            >
              {icon}
            </span>
            <span className="text-[12.5px] text-muted font-semibold">{label}</span>
          </div>
          <span
            className={`text-gray-400 transition-transform duration-200 ${
              expanded ? "rotate-180 text-blue-500" : ""
            }`}
          >
            ▾
          </span>
        </div>
        <p className="text-[28px] font-extrabold tracking-tight mt-3">{value}</p>
      </button>
      <div
        className={`grid transition-all duration-200 ease-out ${
          expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="border-t border-line bg-gray-50 px-[18px] py-4">{children}</div>
        </div>
      </div>
    </div>
  );
}

function BreakdownRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between text-sm py-1">
      <span className="text-gray-600">{label}</span>
      <span className="font-semibold font-mono">{value}</span>
    </div>
  );
}

export default function OverviewCards({
  jobsToday,
  toWashToday,
  washedToday,
  jobsThisWeek,
  weekByCommunity,
  revenueThisMonth,
  revenueByCommunity,
  revenueByCleaner,
}: {
  jobsToday: number;
  toWashToday: number;
  washedToday: number;
  jobsThisWeek: number;
  weekByCommunity: Record<string, number>;
  revenueThisMonth: number;
  revenueByCommunity: Record<string, number>;
  revenueByCleaner: Record<string, number>;
}) {
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  function toggle(card: string) {
    setExpandedCard((prev) => (prev === card ? null : card));
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 items-start">
      <Card
        icon="◷"
        iconBg="#e8f0fe"
        iconFg="#2563eb"
        label="Jobs Today"
        value={jobsToday}
        expanded={expandedCard === "today"}
        onToggle={() => toggle("today")}
      >
        <BreakdownRow label="Cars to wash" value={toWashToday} />
        <BreakdownRow label="Cars washed" value={washedToday} />
      </Card>

      <Card
        icon="▦"
        iconBg="#e7f7ee"
        iconFg="#16a34a"
        label="Jobs This Week"
        value={jobsThisWeek}
        expanded={expandedCard === "week"}
        onToggle={() => toggle("week")}
      >
        {Object.keys(weekByCommunity).length === 0 ? (
          <p className="text-sm text-gray-400">No jobs this week.</p>
        ) : (
          Object.entries(weekByCommunity)
            .sort((a, b) => b[1] - a[1])
            .map(([name, count]) => <BreakdownRow key={name} label={name} value={count} />)
        )}
      </Card>

      <Card
        icon="AED"
        iconBg="#fdeccf"
        iconFg="#d97706"
        label="Revenue This Month"
        value={`AED ${revenueThisMonth.toLocaleString()}`}
        expanded={expandedCard === "revenue"}
        onToggle={() => toggle("revenue")}
      >
        <p className="text-xs font-semibold text-gray-400 uppercase mb-1">By community</p>
        {Object.entries(revenueByCommunity)
          .sort((a, b) => b[1] - a[1])
          .map(([name, amount]) => (
            <BreakdownRow key={name} label={name} value={`AED ${amount.toLocaleString()}`} />
          ))}
        <p className="text-xs font-semibold text-gray-400 uppercase mb-1 mt-3">By cleaner</p>
        {Object.entries(revenueByCleaner)
          .sort((a, b) => b[1] - a[1])
          .map(([name, amount]) => (
            <BreakdownRow key={name} label={name} value={`AED ${amount.toLocaleString()}`} />
          ))}
      </Card>
    </div>
  );
}
