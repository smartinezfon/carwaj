"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LANG_NAMES, RTL_LANGS, type Lang } from "@/lib/i18n";
import { LANDING } from "@/lib/landingCopy";

// Same key the in-app language picker writes, so a cleaner who already chose
// Hindi in the app lands on a Hindi marketing page.
const LS_KEY = "carwaj_lang";

const CONTACT_EMAIL = "hello@carwaj.app";

const LANGS = Object.keys(LANG_NAMES) as Lang[];

function CarLogo({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M3.6 15.2l1.5-3.9A2.5 2.5 0 0 1 7.4 9.6h7.2a2.5 2.5 0 0 1 2.3 1.6l1.5 3.9" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M3 15.2h16v2a1 1 0 0 1-1 1h-.3a1 1 0 0 1-1-1v-.2H5.3v.2a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-2z" stroke="#fff" strokeWidth="1.7" strokeLinejoin="round"/>
      <circle cx="7.3" cy="16.1" r="1.3" fill="#2563eb" stroke="#fff" strokeWidth="1.2"/>
      <circle cx="14.7" cy="16.1" r="1.3" fill="#2563eb" stroke="#fff" strokeWidth="1.2"/>
      <path d="M19.4 4.2C19.6 5.9 20.1 6.4 21.8 6.6C20.1 6.8 19.6 7.3 19.4 9C19.2 7.3 18.7 6.8 17 6.6C18.7 6.4 19.2 5.9 19.4 4.2Z" fill="#fff"/>
    </svg>
  );
}

/** Renders `heroTitle`, splitting on the {accent} placeholder so the highlighted
 *  word can sit anywhere in the sentence — word order differs per language. */
function HeroTitle({ template, accent }: { template: string; accent: string }) {
  const [before, after = ""] = template.split("{accent}");
  return (
    <>
      {before}
      <span className="text-blue-600">{accent}</span>
      {after}
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Mock screens                                                       */
/* ------------------------------------------------------------------ */

function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-card border border-line bg-white p-4 shadow-[0_28px_60px_-38px_rgba(15,23,42,.45)]">
      {children}
    </div>
  );
}

/** Progress ring for the Today card: 2 of 6 done, 1 in progress, 3 left.
 *  Drawn as arcs over a full track ring, rotated so the first slice starts
 *  at 12 o'clock. Same status colours as the booking list underneath. */
function ProgressDonut({ done, inProgress, total }: { done: number; inProgress: number; total: number }) {
  const r = 26;
  const circumference = 2 * Math.PI * r;
  const doneLen = (done / total) * circumference;
  const progressLen = (inProgress / total) * circumference;
  const pct = Math.round((done / total) * 100);

  return (
    <svg width="68" height="68" viewBox="0 0 68 68" className="shrink-0" role="img" aria-label={`${pct}% complete`}>
      <g transform="rotate(-90 34 34)">
        <circle cx="34" cy="34" r={r} fill="none" stroke="#e6eaef" strokeWidth="8" />
        <circle
          cx="34" cy="34" r={r} fill="none" strokeWidth="8" strokeLinecap="butt"
          className="stroke-completed-dot"
          strokeDasharray={`${doneLen} ${circumference - doneLen}`}
        />
        <circle
          cx="34" cy="34" r={r} fill="none" strokeWidth="8" strokeLinecap="butt"
          className="stroke-progress-dot"
          strokeDasharray={`${progressLen} ${circumference - progressLen}`}
          strokeDashoffset={-doneLen}
        />
      </g>
      {/* dir=ltr keeps "2/6" from being reordered to "6/2" in RTL locales */}
      <text
        x="34" y="34" style={{ direction: "ltr" }} textAnchor="middle" dominantBaseline="central"
        className="fill-ink font-mono text-[15px] font-bold"
      >
        {done}/{total}
      </text>
    </svg>
  );
}

function TodayMock({ c }: { c: (typeof LANDING)["en"] }) {
  const rows = [
    { villa: "Villa 214 · Al Barsha", car: "Toyota Land Cruiser", state: "done" },
    { villa: "Villa 87 · Arabian Ranches", car: "Nissan Patrol", state: "progress" },
    { villa: "Villa 12 · Jumeirah Park", car: "Honda Civic", state: "scheduled" },
    { villa: "Villa 33 · Jumeirah Park", car: "Lexus LX 600", state: "scheduled" },
  ];
  return (
    <PhoneFrame>
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[12px] font-semibold uppercase tracking-wide text-muted">{c.mToday}</p>
          <p className="text-[22px] font-extrabold tracking-[-0.03em]">{c.mCars}</p>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px] font-semibold">
            <span className="flex items-center gap-1.5 text-completed-text">
              <span className="h-1.5 w-1.5 rounded-full bg-completed-dot" />{c.mDone}
            </span>
            <span className="flex items-center gap-1.5 text-progress-text">
              <span className="h-1.5 w-1.5 rounded-full bg-progress-dot" />{c.mInProgress}
            </span>
            <span className="flex items-center gap-1.5 text-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-[#e6eaef]" />{c.mLeft}
            </span>
          </div>
        </div>
        <ProgressDonut done={2} inProgress={1} total={6} />
      </div>
      <div className="mt-4 space-y-2">
        {rows.map((row) => (
          <div key={row.villa} className="flex items-center gap-3 rounded-control border border-line bg-[#fbfcfd] px-3.5 py-2.5">
            <span
              className={`h-2 w-2 shrink-0 rounded-full ${
                row.state === "done" ? "bg-completed-dot" : row.state === "progress" ? "bg-progress-dot" : "bg-scheduled-dot"
              }`}
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13.5px] font-bold">{row.villa}</p>
              <p className="truncate text-[12px] text-muted">{row.car}</p>
            </div>
            {row.state === "done" && (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="shrink-0 text-completed-dot">
                <path d="M5 12.5l4.5 4.5L19 7.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
        ))}
      </div>
    </PhoneFrame>
  );
}

function CalendarMock({ c }: { c: (typeof LANDING)["en"] }) {
  // 1st of the month falls on a Tuesday here; dots mirror the real status palette.
  const dots: Record<number, string> = {
    1: "bg-completed-dot", 2: "bg-completed-dot", 4: "bg-completed-dot",
    6: "bg-completed-dot", 8: "bg-completed-dot", 9: "bg-completed-dot",
    11: "bg-completed-dot", 13: "bg-cancelled-dot", 15: "bg-completed-dot",
    16: "bg-completed-dot", 18: "bg-progress-dot", 20: "bg-scheduled-dot",
    22: "bg-scheduled-dot", 23: "bg-scheduled-dot", 25: "bg-scheduled-dot",
    27: "bg-scheduled-dot", 29: "bg-scheduled-dot", 30: "bg-scheduled-dot",
  };
  const cells = [null, null, ...Array.from({ length: 31 }, (_, i) => i + 1)];

  return (
    <PhoneFrame>
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[15px] font-extrabold tracking-[-0.02em]">August 2026</span>
        <div className="flex gap-1.5 text-muted">
          <span className="flex h-6 w-6 items-center justify-center rounded-md border border-line text-[11px]">‹</span>
          <span className="flex h-6 w-6 items-center justify-center rounded-md border border-line text-[11px]">›</span>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-y-1 text-center">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <span key={i} className="text-[10px] font-bold uppercase text-muted">{d}</span>
        ))}
        {cells.map((day, i) => (
          <div key={i} className="flex h-8 flex-col items-center justify-center">
            {day && (
              <>
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-[11.5px] font-semibold ${
                    day === 18 ? "bg-blue-600 text-white" : "text-ink"
                  }`}
                >
                  {day}
                </span>
                <span className={`mt-0.5 h-1 w-1 rounded-full ${dots[day] ?? "bg-transparent"}`} />
              </>
            )}
          </div>
        ))}
      </div>
      <div className="mt-3 rounded-control border border-line bg-[#fbfcfd] px-3 py-2.5">
        <p className="text-[11.5px] font-bold uppercase tracking-wide text-muted">Arabian Ranches</p>
        <p className="mt-1 text-[13px] font-semibold">Villa 87 · Nissan Patrol</p>
        <p className="text-[13px] font-semibold">Villa 90 · Ford Explorer</p>
      </div>
    </PhoneFrame>
  );
}

function ClientsMock({ c }: { c: (typeof LANDING)["en"] }) {
  const active = [
    { villa: "Villa 12", owner: "Ahmed Al Mansoori", cars: 2, aed: 450 },
    { villa: "Villa 33", owner: "Priya Nair", cars: 1, aed: 280 },
    { villa: "Villa 87", owner: "Omar Haddad", cars: 3, aed: 620 },
  ];
  return (
    <PhoneFrame>
      <div className="flex items-center justify-between">
        <span className="text-[11.5px] font-bold uppercase tracking-wide text-completed-text">
          {c.mActive} · 3
        </span>
        <span className="text-[11px] text-muted">Jumeirah Park</span>
      </div>
      <div className="mt-2.5 space-y-2">
        {active.map((r) => (
          <div key={r.villa} className="rounded-control border border-line bg-[#fbfcfd] px-3.5 py-2.5">
            <div className="flex items-center justify-between gap-2">
              <p className="truncate text-[13.5px] font-bold">{r.villa}</p>
              <span className="shrink-0 rounded-pill bg-blue-600/10 px-2 py-0.5 text-[11px] font-bold text-blue-600">
                AED {r.aed}/mo
              </span>
            </div>
            <p className="mt-0.5 truncate text-[12px] text-muted">
              {r.owner} · {r.cars} {r.cars === 1 ? "car" : "cars"}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-line pt-2.5">
        <span className="text-[11.5px] font-bold uppercase tracking-wide text-scheduled-text">
          {c.mPaused} · 1
        </span>
        <span className="text-muted">▾</span>
      </div>
    </PhoneFrame>
  );
}

function PaymentsMock({ c }: { c: (typeof LANDING)["en"] }) {
  return (
    <PhoneFrame>
      <span className="text-[11.5px] font-bold uppercase tracking-wide text-muted">{c.mPending}</span>
      <div className="mt-2.5 space-y-2">
        <div className="rounded-control border border-cancelled-dot/30 bg-cancelled-bg px-3.5 py-3">
          <div className="flex items-center justify-between">
            <p className="text-[13.5px] font-bold">Villa 87</p>
            <p className="text-[13.5px] font-extrabold">AED 620</p>
          </div>
          <p className="mt-0.5 text-[11.5px] font-semibold text-cancelled-text">{c.mOverdue}</p>
          <div className="mt-2.5 flex gap-2">
            <span className="flex-1 rounded-[9px] bg-blue-600 py-1.5 text-center text-[11.5px] font-bold text-white">
              {c.mMarkPaid}
            </span>
          </div>
        </div>
        <div className="rounded-control border border-line bg-[#fbfcfd] px-3.5 py-3">
          <div className="flex items-center justify-between">
            <p className="text-[13.5px] font-bold">Villa 12</p>
            <p className="text-[13.5px] font-extrabold">AED 450</p>
          </div>
          <p className="mt-0.5 text-[11.5px] text-muted">{c.mDue}</p>
        </div>
      </div>
      <div className="mt-3.5 border-t border-line pt-2.5">
        <span className="text-[11.5px] font-bold uppercase tracking-wide text-muted">{c.mPaid}</span>
        <div className="mt-2 flex items-center justify-between rounded-control border border-line bg-completed-bg px-3.5 py-2.5">
          <div>
            <p className="text-[13.5px] font-bold">Villa 33</p>
            <p className="text-[11.5px] font-semibold text-completed-text">transfer · 24 Jul</p>
          </div>
          <p className="text-[13.5px] font-extrabold">AED 280</p>
        </div>
      </div>
    </PhoneFrame>
  );
}

/** Desktop admin dashboard — deliberately wider and denser than the phone
 *  mocks, to show that the office view is a different surface entirely. */
function AdminMock({ c }: { c: (typeof LANDING)["en"] }) {
  const navItems = [
    { label: c.mOverview, icon: "overview", active: true },
    { label: c.mCommunities, icon: "communities", active: false },
    { label: c.mVillas, icon: "villas", active: false },
    { label: c.mEmployees, icon: "users", active: false },
    { label: c.mPayments, icon: "wallet", active: false },
  ];
  const byCommunity = [
    { name: "Arabian Ranches", amount: 9400, pct: 100 },
    { name: "Jumeirah Park", amount: 7800, pct: 83 },
    { name: "Al Barsha", amount: 7400, pct: 79 },
  ];
  const byCleaner = [
    { name: "Imran", amount: 9100 },
    { name: "Rahul", amount: 8200 },
    { name: "Sunil", amount: 7300 },
  ];

  return (
    <div className="overflow-hidden rounded-card border border-line bg-white shadow-[0_36px_80px_-48px_rgba(15,23,42,.5)]">
      {/* Browser chrome */}
      <div className="flex items-center gap-2 border-b border-line bg-[#f7f9fb] px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        <span className="mx-auto rounded-pill bg-white px-3 py-0.5 font-mono text-[10.5px] text-muted" dir="ltr">
          carwaj.app/admin
        </span>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden w-[152px] shrink-0 border-e border-line p-3 sm:block">
          <p className="px-2 pb-2.5 font-mono text-[9.5px] font-bold uppercase tracking-wide text-muted">
            Carwaj Admin
          </p>
          <div className="space-y-0.5">
            {navItems.map((n) => (
              <div
                key={n.label}
                className={`flex items-center gap-2 rounded-[9px] px-2 py-1.5 text-[11.5px] font-semibold ${
                  n.active ? "bg-blue-50 text-blue-600" : "text-muted"
                }`}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
                  {ICONS[n.icon]}
                </svg>
                <span className="truncate">{n.label}</span>
              </div>
            ))}
          </div>
        </aside>

        {/* Content */}
        <div className="min-w-0 flex-1 bg-canvas/50 p-4">
          {/* Stat cards — a label/value row each on phones (three 94px columns
              can't hold "AED 24,600"), the usual dashboard tiles from sm up. */}
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-2.5">
            {[
              { label: c.mJobsToday, value: "14" },
              { label: c.mThisWeek, value: "68" },
              { label: c.mRevenueMonth, value: "24,600", prefix: "AED" },
            ].map((s) => (
              <div
                key={s.label}
                className="flex items-baseline justify-between gap-2 rounded-control border border-line bg-white px-3 py-2.5 sm:block sm:p-3"
              >
                <p className="min-w-0 truncate text-[10.5px] font-semibold text-muted">{s.label}</p>
                <p
                  className="shrink-0 whitespace-nowrap text-[17px] font-extrabold tracking-[-0.04em] tabular-nums sm:mt-1.5 sm:text-[19px]"
                  dir="ltr"
                >
                  {s.prefix && <span className="me-1 text-[11px] font-bold text-muted">{s.prefix}</span>}
                  {s.value}
                </p>
              </div>
            ))}
          </div>

          {/* Breakdowns */}
          <div className="mt-2.5 grid gap-2.5 sm:grid-cols-2">
            <div className="rounded-control border border-line bg-white p-3">
              <p className="text-[10.5px] font-bold uppercase tracking-wide text-muted">{c.mByCommunity}</p>
              <div className="mt-2.5 space-y-2">
                {byCommunity.map((b) => (
                  <div key={b.name}>
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="truncate text-[11.5px] font-semibold">{b.name}</span>
                      <span className="shrink-0 font-mono text-[11px] font-bold tabular-nums" dir="ltr">
                        {b.amount.toLocaleString("en-US")}
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-pill bg-[#eef1f5]">
                      <div className="h-full rounded-pill bg-blue-600" style={{ width: `${b.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-control border border-line bg-white p-3">
              <p className="text-[10.5px] font-bold uppercase tracking-wide text-muted">{c.mByCleaner}</p>
              <div className="mt-2.5 space-y-1.5">
                {byCleaner.map((b) => (
                  <div key={b.name} className="flex items-center gap-2">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink text-[10px] font-bold text-white">
                      {b.name[0]}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[11.5px] font-semibold">{b.name}</span>
                    <span className="shrink-0 font-mono text-[11px] font-bold tabular-nums" dir="ltr">
                      {b.amount.toLocaleString("en-US")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function WhatsAppMock({ c, isRTL }: { c: (typeof LANDING)["en"]; isRTL: boolean }) {
  const msgs = [
    { text: c.waChatMsg1, time: "08:42" },
    { text: c.waChatMsg2, time: "09:15" },
    { text: c.waChatMsg3, time: "11:03" },
  ];
  return (
    <div className="overflow-hidden rounded-card border border-line bg-white shadow-[0_28px_60px_-38px_rgba(15,23,42,.45)]">
      {/* WhatsApp-style header */}
      <div className="flex items-center gap-3 bg-[#075e54] px-4 py-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600">
          <CarLogo size={20} />
        </div>
        <div className="min-w-0">
          <p className="truncate text-[14px] font-bold text-white">Carwaj</p>
          <p className="truncate text-[11px] text-[#a7c4c0]">WhatsApp Business</p>
        </div>
      </div>
      {/* Conversation */}
      <div className="space-y-2.5 bg-[#ece5dd] px-3.5 py-4">
        {msgs.map((m, i) => (
          <div key={i} className="flex" style={{ justifyContent: isRTL ? "flex-start" : "flex-end" }}>
            <div className="max-w-[85%] rounded-[12px] bg-[#dcf8c6] px-3 py-2 shadow-sm">
              <p className="text-[13px] leading-relaxed text-[#0f172a]">{m.text}</p>
              <p className="mt-1 text-end text-[10px] text-[#667781]">{m.time} ✓✓</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Icons                                                              */
/* ------------------------------------------------------------------ */

const ICONS: Record<string, React.ReactNode> = {
  overview: (
    <>
      <rect x="4" y="4" width="7" height="7" rx="2" strokeWidth="1.8" />
      <rect x="13" y="4" width="7" height="7" rx="2" strokeWidth="1.8" />
      <rect x="4" y="13" width="7" height="7" rx="2" strokeWidth="1.8" />
      <rect x="13" y="13" width="7" height="7" rx="2" strokeWidth="1.8" />
    </>
  ),
  communities: (
    <>
      <path d="M12 21s-7-6.1-7-11.2A7 7 0 0 1 19 9.8C19 14.9 12 21 12 21z" strokeWidth="1.8" strokeLinejoin="round" />
      <circle cx="12" cy="9.5" r="2.4" strokeWidth="1.8" />
    </>
  ),
  villas: (
    <>
      <path d="M4 11.5L12 5l8 6.5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 10.5V19h12v-8.5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  list: (
    <>
      <rect x="3.5" y="5" width="17" height="15.5" rx="3" strokeWidth="1.7" />
      <path d="M8 3v4M16 3v4M3.5 10h17" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M9 15l2 2 4-4" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  camera: (
    <>
      <rect x="3" y="7" width="18" height="13" rx="3" strokeWidth="1.7" />
      <path d="M8.5 7l1.4-2.5h4.2L15.5 7" strokeWidth="1.7" strokeLinejoin="round" />
      <circle cx="12" cy="13.5" r="3.5" strokeWidth="1.7" />
    </>
  ),
  repeat: (
    <>
      <path d="M4 12a8 8 0 0 1 13.7-5.6L20 8.5" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20 12a8 8 0 0 1-13.7 5.6L4 15.5" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20 4v4.5h-4.5M4 20v-4.5h4.5" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  wallet: (
    <>
      <rect x="2.5" y="6" width="19" height="12.5" rx="3" strokeWidth="1.7" />
      <path d="M2.5 10.5h19" strokeWidth="1.7" />
      <path d="M6.5 15h3" strokeWidth="1.7" strokeLinecap="round" />
    </>
  ),
  chart: (
    <>
      <path d="M4 20V4" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M4 20h16" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M8 16.5v-4M12.5 16.5v-8M17 16.5v-6" strokeWidth="2.2" strokeLinecap="round" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8.5" r="3.5" strokeWidth="1.7" />
      <path d="M3 19.5c0-3 2.7-5 6-5s6 2 6 5" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M16 5.5a3.5 3.5 0 0 1 0 6.8M17.5 14.8c2 .7 3.5 2.4 3.5 4.7" strokeWidth="1.7" strokeLinecap="round" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="8.5" strokeWidth="1.7" />
      <path d="M3.5 12h17M12 3.5c2.2 2.4 3.3 5.4 3.3 8.5S14.2 18.1 12 20.5c-2.2-2.4-3.3-5.4-3.3-8.5S9.8 5.9 12 3.5Z" strokeWidth="1.7" />
    </>
  ),
  phone: (
    <>
      <rect x="6" y="2.5" width="12" height="19" rx="3" strokeWidth="1.7" />
      <path d="M10.5 18.5h3" strokeWidth="1.7" strokeLinecap="round" />
    </>
  ),
};

function FeatureIcon({ name }: { name: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
      {ICONS[name]}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function LandingPage() {
  const [lang, setLang] = useState<Lang>("en");

  useEffect(() => {
    const stored = localStorage.getItem(LS_KEY) as Lang | null;
    if (stored && LANGS.includes(stored)) setLang(stored);
  }, []);

  function chooseLang(l: Lang) {
    setLang(l);
    localStorage.setItem(LS_KEY, l);
  }

  const c = LANDING[lang];
  const isRTL = RTL_LANGS.has(lang);

  // Ask for a smooth scroll, but don't trust it: some engines accept the
  // options form and then never animate, leaving the page exactly where it
  // was. The follow-up check guarantees we actually end up at the top.
  function toTop(e: React.MouseEvent) {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
    window.setTimeout(() => {
      if (window.scrollY > 0) window.scrollTo(0, 0);
    }, 600);
  }

  const waItems = [
    { title: c.wa1Title, body: c.wa1Body },
    { title: c.wa2Title, body: c.wa2Body },
    { title: c.wa3Title, body: c.wa3Body },
    { title: c.wa4Title, body: c.wa4Body },
    { title: c.wa5Title, body: c.wa5Body },
  ];

  const features = [
    { icon: "list", title: c.f1Title, body: c.f1Body },
    { icon: "camera", title: c.f2Title, body: c.f2Body },
    { icon: "repeat", title: c.f3Title, body: c.f3Body },
    { icon: "wallet", title: c.f4Title, body: c.f4Body },
    { icon: "chart", title: c.f5Title, body: c.f5Body },
    { icon: "users", title: c.f6Title, body: c.f6Body },
  ];

  const steps = [
    { n: "1", title: c.s1Title, body: c.s1Body },
    { n: "2", title: c.s2Title, body: c.s2Body },
    { n: "3", title: c.s3Title, body: c.s3Body },
    { n: "4", title: c.s4Title, body: c.s4Body },
  ];

  return (
    <main dir={isRTL ? "rtl" : "ltr"} lang={lang} className="bg-canvas text-ink">
      {/* ---------- Nav ---------- */}
      <header className="sticky top-0 z-50 border-b border-line/70 bg-canvas/85 backdrop-blur-md">
        <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5">
          <a
            href="#"
            onClick={toTop}
            className="flex min-h-11 shrink-0 items-center gap-2.5"
            aria-label="Carwaj — back to top"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-[11px] bg-blue-600 shadow-[0_8px_18px_-8px_rgba(37,99,235,.6)]">
              <CarLogo size={21} />
            </div>
            <span className="text-[19px] font-extrabold tracking-[-0.03em]">Carwaj</span>
          </a>

          <div className="hidden items-center gap-7 text-[14.5px] font-medium text-muted md:flex">
            <a href="#whatsapp" className="transition-colors hover:text-ink">{c.navWhatsapp}</a>
            <a href="#features" className="transition-colors hover:text-ink">{c.navFeatures}</a>
            <a href="#how" className="transition-colors hover:text-ink">{c.navHow}</a>
          </div>

          <div className="flex shrink-0 items-center gap-2.5">
            <label className="sr-only" htmlFor="lang">Language</label>
            <select
              id="lang"
              value={lang}
              onChange={(e) => chooseLang(e.target.value as Lang)}
              className="h-11 cursor-pointer rounded-control border border-line bg-white px-2.5 text-[13.5px] font-semibold text-ink outline-none focus:border-blue-500 sm:h-9"
            >
              {LANGS.map((l) => (
                <option key={l} value={l}>{LANG_NAMES[l]}</option>
              ))}
            </select>
            <Link
              href="/login"
              className="flex min-h-11 items-center rounded-pill bg-ink px-4 text-[14px] font-bold text-white transition-colors hover:bg-[#1e293b] sm:min-h-0 sm:py-2"
            >
              {c.navSignIn}
            </Link>
          </div>
        </nav>
      </header>

      {/* ---------- Hero ---------- */}
      <section className="relative overflow-hidden px-5 pb-16 pt-14 sm:pt-20">
        <div aria-hidden className="pointer-events-none absolute left-1/2 top-[-240px] h-[540px] w-[860px] -translate-x-1/2 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="relative mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-pill border border-line bg-white px-3.5 py-1.5 text-[12.5px] font-semibold text-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-completed-dot" />
            {c.heroBadge}
          </span>

          <h1 className="mt-6 text-[38px] font-extrabold leading-[1.08] tracking-[-0.04em] sm:text-[56px]">
            <HeroTitle template={c.heroTitle} accent={c.heroAccent} />
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-[16.5px] leading-relaxed text-muted sm:text-[18px]">
            {c.heroSub}
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href="#contact"
              className="h-12 w-full rounded-control bg-blue-600 px-7 text-[15px] font-bold leading-[48px] text-white shadow-[0_12px_26px_-10px_rgba(37,99,235,.65)] transition-colors hover:bg-[#1d4ed8] sm:w-auto"
            >
              {c.heroCta1}
            </a>
            <Link
              href="/login"
              className="h-12 w-full rounded-control border border-line bg-white px-7 text-[15px] font-bold leading-[46px] text-ink transition-colors hover:border-[#cbd5e1] sm:w-auto"
            >
              {c.heroCta2}
            </Link>
          </div>

          <p className="mt-4 text-[13px] text-muted">{c.heroNote}</p>
        </div>

        <div className="relative mx-auto mt-14 max-w-[380px]">
          <TodayMock c={c} />
        </div>
      </section>

      {/* ---------- WhatsApp ---------- */}
      <section id="whatsapp" className="scroll-mt-20 border-y border-line bg-white px-5 py-20 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Copy */}
            <div>
              <p className="inline-flex items-center gap-2 rounded-pill bg-[#25d366]/12 px-3 py-1.5 text-[12.5px] font-bold uppercase tracking-[0.08em] text-[#128c7e]">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.1-1.3A10 10 0 1 0 12 2Zm5.2 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .1-1.7-.1-.4-.1-.9-.3-1.5-.6-2.7-1.2-4.4-3.9-4.5-4.1-.1-.2-1.1-1.4-1.1-2.6 0-1.2.6-1.8.9-2.1.2-.2.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 1.9c.1.2.1.4 0 .6l-.3.4-.4.4c-.1.1-.3.3-.1.6.2.3.7 1.2 1.6 2 1.1.9 1.9 1.2 2.2 1.4.3.1.5.1.6-.1l.9-1c.2-.2.4-.2.6-.1l1.8.9c.2.1.4.2.5.3 0 .1 0 .7-.3 1.3Z" />
                </svg>
                {c.waEyebrow}
              </p>
              <h2 className="mt-4 text-[30px] font-extrabold leading-[1.15] tracking-[-0.035em] sm:text-[40px]">
                {c.waTitle}
              </h2>
              <p className="mt-4 text-[16.5px] leading-relaxed text-muted">{c.waSub}</p>

              <ol className="mt-8 space-y-4">
                {waItems.map((item, i) => (
                  <li key={item.title} className="flex gap-4">
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#25d366]/15 font-mono text-[12px] font-bold text-[#128c7e]">
                      {i + 1}
                    </span>
                    <div>
                      <h3 className="text-[15.5px] font-extrabold tracking-[-0.02em]">{item.title}</h3>
                      <p className="mt-1 text-[14.5px] leading-relaxed text-muted">{item.body}</p>
                    </div>
                  </li>
                ))}
              </ol>

              <p className="mt-8 rounded-control border border-line bg-canvas/70 px-4 py-3 text-[13px] leading-relaxed text-muted">
                {c.waNote}
              </p>
            </div>

            {/* Chat mock */}
            <div className="mx-auto w-full max-w-[400px] lg:sticky lg:top-24">
              <WhatsAppMock c={c} isRTL={isRTL} />
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Screens ---------- */}
      <section id="screens" className="scroll-mt-20 px-5 py-20 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <p className="text-[13px] font-bold uppercase tracking-[0.12em] text-blue-600">{c.screensEyebrow}</p>
            <h2 className="mt-3 text-[30px] font-extrabold tracking-[-0.035em] sm:text-[40px]">{c.screensTitle}</h2>
            <p className="mt-4 text-[16.5px] leading-relaxed text-muted">{c.screensSub}</p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {[
              { title: c.scCalTitle, body: c.scCalBody, mock: <CalendarMock c={c} /> },
              { title: c.scClientsTitle, body: c.scClientsBody, mock: <ClientsMock c={c} /> },
              { title: c.scPayTitle, body: c.scPayBody, mock: <PaymentsMock c={c} /> },
            ].map((s) => (
              <div key={s.title}>
                {s.mock}
                <h3 className="mt-5 text-[17px] font-extrabold tracking-[-0.02em]">{s.title}</h3>
                <p className="mt-1.5 text-[14.5px] leading-relaxed text-muted">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Admin / office ---------- */}
      <section id="admin" className="scroll-mt-20 border-t border-line bg-white px-5 py-20 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <p className="text-[13px] font-bold uppercase tracking-[0.12em] text-blue-600">{c.adminEyebrow}</p>
            <h2 className="mt-3 text-[30px] font-extrabold tracking-[-0.035em] sm:text-[40px]">{c.adminTitle}</h2>
            <p className="mt-4 text-[16.5px] leading-relaxed text-muted">{c.adminSub}</p>
          </div>

          <div className="mt-12">
            <AdminMock c={c} />
          </div>

          <div className="mt-10 grid gap-x-10 gap-y-7 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: "communities", title: c.a1Title, body: c.a1Body },
              { icon: "villas", title: c.a2Title, body: c.a2Body },
              { icon: "users", title: c.a3Title, body: c.a3Body },
              { icon: "wallet", title: c.a4Title, body: c.a4Body },
            ].map((a) => (
              <div key={a.title}>
                <div className="flex h-9 w-9 items-center justify-center rounded-control bg-blue-600/10 text-blue-600">
                  <FeatureIcon name={a.icon} />
                </div>
                <h3 className="mt-3.5 text-[16px] font-extrabold tracking-[-0.02em]">{a.title}</h3>
                <p className="mt-1.5 text-[14px] leading-relaxed text-muted">{a.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Features ---------- */}
      <section id="features" className="scroll-mt-20 border-t border-line bg-canvas px-5 py-20 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <p className="text-[13px] font-bold uppercase tracking-[0.12em] text-blue-600">{c.featEyebrow}</p>
            <h2 className="mt-3 text-[30px] font-extrabold tracking-[-0.035em] sm:text-[40px]">{c.featTitle}</h2>
            <p className="mt-4 text-[16.5px] leading-relaxed text-muted">{c.featSub}</p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-card border border-line bg-white p-6 transition-shadow hover:shadow-[0_18px_40px_-28px_rgba(15,23,42,.35)]"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-control bg-blue-600/10 text-blue-600">
                  <FeatureIcon name={f.icon} />
                </div>
                <h3 className="mt-4 text-[17px] font-extrabold tracking-[-0.02em]">{f.title}</h3>
                <p className="mt-2 text-[14.5px] leading-relaxed text-muted">{f.body}</p>
              </div>
            ))}
          </div>

          {/* Two-up strip */}
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            {[
              { icon: "globe", title: c.strip1Title, body: c.strip1Body },
              { icon: "phone", title: c.strip2Title, body: c.strip2Body },
            ].map((s) => (
              <div key={s.title} className="flex gap-4 rounded-card border border-line bg-white p-6">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-control bg-ink text-white">
                  <FeatureIcon name={s.icon} />
                </div>
                <div>
                  <h3 className="text-[17px] font-extrabold tracking-[-0.02em]">{s.title}</h3>
                  <p className="mt-2 text-[14.5px] leading-relaxed text-muted">{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- How it works ---------- */}
      <section id="how" className="scroll-mt-20 border-t border-line bg-white px-5 py-20 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <p className="text-[13px] font-bold uppercase tracking-[0.12em] text-blue-600">{c.howEyebrow}</p>
            <h2 className="mt-3 text-[30px] font-extrabold tracking-[-0.035em] sm:text-[40px]">{c.howTitle}</h2>
            <p className="mt-4 text-[16.5px] leading-relaxed text-muted">{c.howSub}</p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s) => (
              <div key={s.n} className="rounded-card border border-line bg-canvas/60 p-7">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ink font-mono text-[15px] font-bold text-white">
                  {s.n}
                </span>
                <h3 className="mt-5 text-[17.5px] font-extrabold tracking-[-0.02em]">{s.title}</h3>
                <p className="mt-2 text-[14.5px] leading-relaxed text-muted">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- CTA ---------- */}
      <section id="contact" className="scroll-mt-20 px-5 pb-24">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-card bg-ink px-8 py-16 text-center sm:px-16">
          <h2 className="text-[28px] font-extrabold tracking-[-0.035em] text-white sm:text-[38px]">{c.ctaTitle}</h2>
          <p className="mx-auto mt-4 max-w-xl text-[16px] leading-relaxed text-[#94a3b8]">{c.ctaSub}</p>
          <a
            href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(c.ctaMessage)}`}
            className="mt-9 inline-flex h-12 items-center gap-2.5 rounded-control bg-blue-600 px-7 text-[15px] font-bold text-white transition-colors hover:bg-[#1d4ed8]"
          >
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
              <rect x="2.5" y="4.5" width="19" height="15" rx="3" strokeWidth="1.8" />
              <path d="M3.5 7l8.5 6 8.5-6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {c.ctaBtn}
          </a>
          <p className="mt-4 font-mono text-[13px] text-[#94a3b8]" dir="ltr">
            {CONTACT_EMAIL}
          </p>
        </div>
      </section>

      {/* ---------- Footer ---------- */}
      <footer className="border-t border-line px-5 py-9">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <a href="#" onClick={toTop} className="flex min-h-11 items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-[9px] bg-blue-600">
              <CarLogo size={16} />
            </div>
            <span className="text-[15px] font-extrabold tracking-[-0.03em]">Carwaj</span>
            <span className="text-[13.5px] text-muted">· {c.footerTagline}</span>
          </a>
          <p className="text-[13.5px] text-muted">
            © {new Date().getFullYear()} Carwaj · {c.footerPlace}
          </p>
        </div>
      </footer>
    </main>
  );
}
