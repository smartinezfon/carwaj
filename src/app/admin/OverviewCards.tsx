// No longer a client component: the breakdowns used to be collapsed behind a
// chevron, so this needed useState. They are laid out on the page now, which
// means no interactivity, no hooks, and no JS shipped for this view.

function IconClock({ fg }: { fg: string }) {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="8.5" stroke={fg} strokeWidth="1.9"/>
      <path d="M12 7.5V12l3 2" stroke={fg} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function IconCalendar({ fg }: { fg: string }) {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="5.5" width="16" height="15" rx="3" stroke={fg} strokeWidth="1.9"/>
      <path d="M4 10h16M8.5 3.5v4M15.5 3.5v4" stroke={fg} strokeWidth="1.9" strokeLinecap="round"/>
    </svg>
  );
}
function IconWallet({ fg }: { fg: string }) {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="6" width="18" height="12" rx="3" stroke={fg} strokeWidth="1.9"/>
      <path d="M3 10h18" stroke={fg} strokeWidth="1.9"/>
      <circle cx="16.5" cy="14" r="1.2" fill={fg}/>
    </svg>
  );
}

const aed = (n: number) => `AED ${n.toLocaleString("en-US")}`;

function StatCard({
  iconType,
  iconBg,
  iconFg,
  label,
  value,
  sub,
}: {
  iconType: "clock" | "calendar" | "wallet";
  iconBg: string;
  iconFg: string;
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="rounded-[20px] bg-white border border-[#e6eaef] p-[18px]">
      <div className="flex items-center gap-2">
        <span
          className="h-[30px] w-[30px] rounded-[9px] flex items-center justify-center shrink-0"
          style={{ backgroundColor: iconBg }}
        >
          {iconType === "clock" && <IconClock fg={iconFg} />}
          {iconType === "calendar" && <IconCalendar fg={iconFg} />}
          {iconType === "wallet" && <IconWallet fg={iconFg} />}
        </span>
        <span className="text-[12.5px] text-[#7b8696] font-semibold">{label}</span>
      </div>
      <p className="text-[28px] font-extrabold tracking-[-0.04em] mt-3 tabular-nums">{value}</p>
      {sub && <p className="text-[12.5px] text-[#7b8696] mt-1">{sub}</p>}
    </div>
  );
}

/** Ranked rows with a bar scaled to the largest value, so the leader is
 *  obvious without reading any numbers. */
function BreakdownPanel({
  title,
  rows,
  format,
  emptyText,
  avatars = false,
}: {
  title: string;
  rows: Record<string, number>;
  format: (n: number) => string;
  emptyText: string;
  avatars?: boolean;
}) {
  const entries = Object.entries(rows).sort((a, b) => b[1] - a[1]);
  const max = entries.length ? entries[0][1] : 0;

  return (
    <div className="rounded-[20px] bg-white border border-[#e6eaef] p-[18px] self-start">
      <p className="text-[11.5px] font-bold uppercase tracking-wide text-[#7b8696]">{title}</p>
      {entries.length === 0 ? (
        <p className="text-sm text-gray-400 mt-3">{emptyText}</p>
      ) : (
        <div className={avatars ? "mt-3 space-y-2.5" : "mt-3 space-y-3"}>
          {entries.map(([name, amount]) => (
            <div key={name}>
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 min-w-0">
                  {avatars && (
                    <span className="h-6 w-6 shrink-0 rounded-full bg-ink text-white flex items-center justify-center text-[10px] font-bold">
                      {name.charAt(0).toUpperCase()}
                    </span>
                  )}
                  <span className="truncate text-[13.5px] font-semibold">{name}</span>
                </span>
                <span className="shrink-0 font-mono text-[12.5px] font-bold tabular-nums">
                  {format(amount)}
                </span>
              </div>
              {!avatars && (
                <div className="mt-1.5 h-1.5 rounded-full bg-[#eef1f5] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-blue-600"
                    style={{ width: max > 0 ? `${Math.max((amount / max) * 100, 4)}%` : "0%" }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function OverviewCards({
  jobsToday,
  toWashToday,
  washedToday,
  jobsThisWeek,
  weekByCommunity,
  revenueDueThisMonth,
  collectedThisMonth,
  outstandingThisMonth,
  revenueByCommunity,
  revenueByVilla,
  revenueByCleaner,
  unpricedVillas,
}: {
  jobsToday: number;
  toWashToday: number;
  washedToday: number;
  jobsThisWeek: number;
  weekByCommunity: Record<string, number>;
  revenueDueThisMonth: number;
  collectedThisMonth: number;
  outstandingThisMonth: number;
  revenueByCommunity: Record<string, number>;
  revenueByVilla: Record<string, number>;
  revenueByCleaner: Record<string, number>;
  unpricedVillas: string[];
}) {
  const noRevenueYet = "Nothing due this month.";

  return (
    <div className="space-y-3.5">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <StatCard
          iconType="clock"
          iconBg="#e8f0fe"
          iconFg="#2563eb"
          label="Jobs Today"
          value={jobsToday}
          sub={`${toWashToday} to wash · ${washedToday} washed`}
        />
        <StatCard
          iconType="calendar"
          iconBg="#e7f7ee"
          iconFg="#16a34a"
          label="Jobs This Week"
          value={jobsThisWeek}
        />
        <StatCard
          iconType="wallet"
          iconBg="#fdeccf"
          iconFg="#d97706"
          label="Revenue Due This Month"
          value={aed(revenueDueThisMonth)}
          sub={`${aed(collectedThisMonth)} collected · ${aed(outstandingThisMonth)} outstanding`}
        />
      </div>

      {unpricedVillas.length > 0 && (
        <div className="rounded-[20px] border border-[#f59e0b] bg-[#fff4e5] p-[18px]">
          <p className="text-[13.5px] font-bold text-[#b45309]">
            {unpricedVillas.length} active {unpricedVillas.length === 1 ? "subscription has" : "subscriptions have"} no price set
          </p>
          <p className="text-[12.5px] text-[#b45309] mt-1">
            Villa {unpricedVillas.join(", ")} — these bill AED 0, so their washes never turn into
            revenue. Set a monthly amount on the client to fix it.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 items-start">
        <BreakdownPanel
          title="Revenue due by community"
          rows={revenueByCommunity}
          format={aed}
          emptyText={noRevenueYet}
        />
        <BreakdownPanel
          title="Revenue due by villa"
          rows={revenueByVilla}
          format={aed}
          emptyText={noRevenueYet}
        />
        <BreakdownPanel
          title="Revenue due by cleaner"
          rows={revenueByCleaner}
          format={aed}
          emptyText={noRevenueYet}
          avatars
        />
        <BreakdownPanel
          title="Jobs this week by community"
          rows={weekByCommunity}
          format={(n) => String(n)}
          emptyText="No jobs this week."
        />
      </div>
    </div>
  );
}
