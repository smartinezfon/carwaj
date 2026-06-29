import { localDateStr, localWeekday, startOfBusinessDay } from "./date";

const WEEKS_AHEAD = 4;

interface GenerateBookingsParams {
  subscriptionId: string;
  carIds: string[];
  employeeId: string;
  weekdays: number[];
  timeWindowStart: string;
  timeWindowEnd: string;
}

export function generateUpcomingBookings({
  subscriptionId,
  carIds,
  employeeId,
  weekdays,
  timeWindowStart,
  timeWindowEnd,
}: GenerateBookingsParams) {
  const timeSlot = `${timeWindowStart.slice(0, 5)} - ${timeWindowEnd.slice(0, 5)}`;
  const rows: {
    car_id: string;
    employee_id: string;
    subscription_id: string;
    scheduled_date: string;
    scheduled_time_slot: string;
  }[] = [];

  const today = startOfBusinessDay();

  for (let dayOffset = 0; dayOffset < WEEKS_AHEAD * 7; dayOffset++) {
    const date = new Date(today.getTime() + dayOffset * 24 * 60 * 60 * 1000);
    if (!weekdays.includes(localWeekday(date))) continue;

    const dateStr = localDateStr(date);
    for (const carId of carIds) {
      rows.push({
        car_id: carId,
        employee_id: employeeId,
        subscription_id: subscriptionId,
        scheduled_date: dateStr,
        scheduled_time_slot: timeSlot,
      });
    }
  }

  return rows;
}
