"use client";

import { useWeeklyAchievementChart } from "../model";
import { SectionCard } from "@/shared/ui";
import { WeeklyAchievementChart } from "./WeeklyAchievementChart";
import { WeeklyAchievementSummary } from "./WeeklyAchievementSummary";

export function WeeklyAchievementSection() {
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
  } = useWeeklyAchievementChart();

  return (
    <section>
      <h2 className="text-base font-semibold text-black">할 일 달성률</h2>
      <SectionCard className="mt-3">
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
