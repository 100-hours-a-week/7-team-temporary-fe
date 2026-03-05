import { DAYS_IN_WEEK } from "./weeklyAchievement.constants";

const toDateFromIso = (dateString?: string | null) => {
  if (!dateString) return new Date();
  const [year, month, day] = dateString.split("-").map(Number);

  if (!year || !month || !day) return new Date();
  return new Date(year, month - 1, day);
};

const toStartOfWeek = (date: Date) => {
  const dayIndex = date.getDay();
  const diffFromMonday = (dayIndex + 6) % 7;
  const start = new Date(date);
  start.setDate(date.getDate() - diffFromMonday);
  start.setHours(0, 0, 0, 0);
  return start;
};

const addDays = (date: Date, amount: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
};

const formatReportDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}년 ${month}월 ${day}일`;
};

const formatIsoDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export const getWeeklyReportStartDate = (baseDate?: string | null) => {
  const referenceDate = toDateFromIso(baseDate);
  const weekStart = toStartOfWeek(referenceDate);
  return formatIsoDate(weekStart);
};

export const getWeeklyReportPeriodLabelFromRange = (startDate: string, endDate: string) => {
  const start = toDateFromIso(startDate);
  const end = toDateFromIso(endDate);
  return `${formatReportDate(start)} ~ ${formatReportDate(end)}`;
};

export const getWeeklyReportPeriodLabel = (baseDate?: string | null) => {
  const weekStart = toStartOfWeek(toDateFromIso(baseDate));
  const weekEnd = addDays(weekStart, DAYS_IN_WEEK - 1);

  return `${formatReportDate(weekStart)} ~ ${formatReportDate(weekEnd)}`;
};
