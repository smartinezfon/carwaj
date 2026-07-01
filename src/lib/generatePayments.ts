function pad(n: number) {
  return String(n).padStart(2, "0");
}

interface GeneratePaymentsParams {
  villaId: string;
  employeeId: string;
  subscriptionId: string;
  amount: number;
  firstPaymentDate: string; // YYYY-MM-DD — the explicit due date for the first payment
}

// Generates one payment due on firstPaymentDate (and rolls forward monthly for
// each additional month requested).
export function generateUpcomingPayments({
  villaId,
  employeeId,
  subscriptionId,
  amount,
  firstPaymentDate,
}: GeneratePaymentsParams) {
  const [year, month, day] = firstPaymentDate.split("-").map(Number);

  // Generate only the first payment; subsequent payments are created one at a
  // time when the previous one is marked paid (see /api/payments/[id]/route.ts).
  const due = new Date(year, month - 1, day);
  const dueStr = `${due.getFullYear()}-${pad(due.getMonth() + 1)}-${pad(due.getDate())}`;

  return [
    {
      villa_id: villaId,
      employee_id: employeeId,
      subscription_id: subscriptionId,
      amount,
      due_date: dueStr,
      status: "pending" as const,
    },
  ];
}
