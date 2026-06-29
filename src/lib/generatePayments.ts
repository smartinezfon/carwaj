const MONTHS_AHEAD = 1;

function pad(n: number) {
  return String(n).padStart(2, "0");
}

interface GeneratePaymentsParams {
  villaId: string;
  employeeId: string;
  subscriptionId: string;
  amount: number;
  startDate: string; // YYYY-MM-DD, the schedule's start date
}

// Generates one payment due per month for the next few months, starting one
// month after the schedule's start date.
export function generateUpcomingPayments({
  villaId,
  employeeId,
  subscriptionId,
  amount,
  startDate,
}: GeneratePaymentsParams) {
  const [year, month, day] = startDate.split("-").map(Number);
  const rows: {
    villa_id: string;
    employee_id: string;
    subscription_id: string;
    amount: number;
    due_date: string;
    status: "pending";
  }[] = [];

  for (let i = 1; i <= MONTHS_AHEAD; i++) {
    // Plain calendar-date arithmetic (no timezone involved) — Date normalizes
    // month overflow and day-count differences correctly (e.g. Jan 31 + 1mo).
    const due = new Date(year, month - 1 + i, day);
    const dueStr = `${due.getFullYear()}-${pad(due.getMonth() + 1)}-${pad(due.getDate())}`;
    rows.push({
      villa_id: villaId,
      employee_id: employeeId,
      subscription_id: subscriptionId,
      amount,
      due_date: dueStr,
      status: "pending",
    });
  }

  return rows;
}
