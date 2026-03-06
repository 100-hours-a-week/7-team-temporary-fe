import type { WeeklyReportDto } from "../api";

import type { WeeklyReportVM, WeeklyReportDailyStatVM } from "./types";

const WEEKDAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"] as const;

function toDayLabel(dateString: string) {
  const [year, month, day] = dateString.split("-").map(Number);
  const date =
    Number.isFinite(year) && Number.isFinite(month) && Number.isFinite(day)
      ? new Date(year, month - 1, day)
      : new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";
  return WEEKDAY_LABELS[date.getDay()] ?? "";
}

function toDailyStatVM(item: WeeklyReportDto["dailyStats"][number]): WeeklyReportDailyStatVM {
  return {
    date: item.date,
    day: toDayLabel(item.date),
    achievementRate: item.achievementRate,
  };
}

export function toWeeklyReportModel(dto: WeeklyReportDto): WeeklyReportVM {
  return {
    reportId: dto.reportId,
    startDate: dto.startDate,
    endDate: dto.endDate,
    aiReportResponseLimit: dto.aiReportResponseLimit,
    aiReportResponseUsed: dto.aiReportResponseUsed,
    dailyStats: [...dto.dailyStats].sort((a, b) => a.date.localeCompare(b.date)).map(toDailyStatVM),
  };
}
