export const WEEKDAY_LABELS = ["월", "화", "수", "목", "금", "토", "일"] as const;
export const DAYS_IN_WEEK = 7;
export const START_HOUR = 8;
export const END_HOUR = 24;

export const toStartOfWeek = (date: Date) => {
  const dayIndex = date.getDay();
  const diffFromMonday = (dayIndex + 6) % 7;
  const start = new Date(date);
  start.setDate(date.getDate() - diffFromMonday);
  start.setHours(0, 0, 0, 0);
  return start;
};

export const addDays = (date: Date, amount: number) => {
  const next = new Date(date);
  next.setDate(date.getDate() + amount);
  return next;
};

export const isSameDate = (left: Date, right: Date) =>
  left.getFullYear() === right.getFullYear() &&
  left.getMonth() === right.getMonth() &&
  left.getDate() === right.getDate();

export const getRepresentativeMonthIndex = (weekDays: Date[]) => {
  const monthCounts = new Map<number, number>();
  weekDays.forEach((day) => {
    monthCounts.set(day.getMonth(), (monthCounts.get(day.getMonth()) ?? 0) + 1);
  });

  return [...monthCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? weekDays[0].getMonth();
};
