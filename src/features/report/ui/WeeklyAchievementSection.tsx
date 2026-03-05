"use client";

import { useWeeklyAchievementChart } from "../model";
import type { WeeklyAchievementPoint } from "../model";
import { SectionCard } from "@/shared/ui";
import { WeeklyAchievementChart } from "./WeeklyAchievementChart";
import { WeeklyAchievementSummary } from "./WeeklyAchievementSummary";

interface WeeklyAchievementSectionProps {
  points: WeeklyAchievementPoint[];
  isLoading?: boolean;
  isError?: boolean;
}

export function WeeklyAchievementSection({
  points,
  isLoading = false,
  isError = false,
}: WeeklyAchievementSectionProps) {
  const {
    chartData,
    selectedPoint,
    tooltipLeftPx,
    chartWrapRef,
    bestDay,
    averageRate,
    cells,
    handleSelectPoint,
    handleChartMouseMove,
    handleChartMouseLeave,
    tooltipTopPx,
  } = useWeeklyAchievementChart({ points });

  return (
    <section>
      <h2 className="text-base font-semibold text-black">할 일 달성률</h2>
      <SectionCard className="mt-3">
        {isError ? (
          <p className="text-sm text-neutral-500">주간 리포트를 불러오지 못했습니다.</p>
        ) : null}
        {isLoading ? (
          <p className="text-sm text-neutral-500">주간 리포트를 불러오는 중...</p>
        ) : null}
        <WeeklyAchievementSummary
          bestDay={bestDay}
          averageRate={averageRate}
        />
        <WeeklyAchievementChart
          chartData={chartData}
          selectedPoint={selectedPoint}
          tooltipLeftPx={tooltipLeftPx}
          tooltipTopPx={tooltipTopPx}
          chartWrapRef={chartWrapRef}
          averageRate={averageRate}
          bestDay={bestDay}
          cells={cells}
          onSelectPoint={handleSelectPoint}
          onChartMouseMove={handleChartMouseMove}
          onChartMouseLeave={handleChartMouseLeave}
        />
      </SectionCard>
    </section>
  );
}
