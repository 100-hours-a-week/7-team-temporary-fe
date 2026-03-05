"use client";

import { useMemo } from "react";

import { useWeeklyReportQuery } from "@/entities/report";

import type { WeeklyAchievementPoint } from "./types";
import {
  getWeeklyReportPeriodLabel,
  getWeeklyReportPeriodLabelFromRange,
  getWeeklyReportStartDate,
} from "./weeklyReportDate";
import {
  WEEKLY_ACHIEVEMENT_DAY_LABELS,
  WEEKLY_ACHIEVEMENT_ZERO,
} from "./weeklyAchievement.constants";

interface UseWeeklyReportDataOptions {
  baseDate?: string | null;
}

export function useWeeklyReportData({ baseDate }: UseWeeklyReportDataOptions) {
  const startDate = useMemo(() => getWeeklyReportStartDate(baseDate), [baseDate]);
  const weeklyReportQuery = useWeeklyReportQuery({ startDate });

  const achievementPoints = useMemo<WeeklyAchievementPoint[]>(() => {
    const dailyStats = weeklyReportQuery.data?.dailyStats;
    if (!dailyStats || dailyStats.length === 0) return WEEKLY_ACHIEVEMENT_ZERO;

    const rateByDay = new Map(dailyStats.map((item) => [item.day, item.achievementRate]));
    return WEEKLY_ACHIEVEMENT_DAY_LABELS.map((day) => ({
      day,
      rate: rateByDay.get(day) ?? 0,
    }));
  }, [weeklyReportQuery.data?.dailyStats]);

  const periodLabel = useMemo(() => {
    const report = weeklyReportQuery.data;
    if (!report) return getWeeklyReportPeriodLabel(baseDate);
    return getWeeklyReportPeriodLabelFromRange(report.startDate, report.endDate);
  }, [baseDate, weeklyReportQuery.data]);

  return {
    report: weeklyReportQuery.data ?? null,
    achievementPoints,
    periodLabel,
    isLoading: weeklyReportQuery.isLoading,
    isError: weeklyReportQuery.isError,
  };
}
