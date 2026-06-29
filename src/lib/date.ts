// All scheduling in this app is anchored to the business's own timezone
// (Dubai, UTC+4, no DST) rather than whichever timezone the server process
// happens to run in (Vercel defaults to UTC) or the device's local clock.
const BUSINESS_TIMEZONE = "Asia/Dubai";

const dateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: BUSINESS_TIMEZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const weekdayFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: BUSINESS_TIMEZONE,
  weekday: "short",
});

const WEEKDAY_INDEX: Record<string, number> = {
  Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
};

// Returns the business-timezone calendar date as YYYY-MM-DD.
export function localDateStr(date: Date = new Date()): string {
  return dateFormatter.format(date);
}

// Returns the business-timezone weekday (0=Sun..6=Sat), unlike Date#getDay()
// which uses whatever timezone the JS runtime is configured with.
export function localWeekday(date: Date): number {
  return WEEKDAY_INDEX[weekdayFormatter.format(date)];
}

// Midnight at the start of "today" in the business timezone, as a real instant.
export function startOfBusinessDay(date: Date = new Date()): Date {
  return new Date(`${localDateStr(date)}T00:00:00+04:00`);
}

// Midnight at the start of the current business-timezone week (Monday-first).
export function startOfBusinessWeek(date: Date = new Date()): Date {
  const dayStart = startOfBusinessDay(date);
  const weekday = localWeekday(dayStart);
  const diff = (weekday + 6) % 7; // Monday-first offset
  return new Date(dayStart.getTime() - diff * 24 * 60 * 60 * 1000);
}
