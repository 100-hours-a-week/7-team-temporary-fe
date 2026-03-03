import { KOREAN_WEEKDAY_LABELS_BY_GETDAY } from "./calendar";

export function formatDateToYmd(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatScheduleLabel(date: Date) {
  if (Number.isNaN(date.getTime())) return "";
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const weekday = KOREAN_WEEKDAY_LABELS_BY_GETDAY[date.getDay()] ?? "";
  return `${month}.${day} (${weekday}) 일정`;
}
