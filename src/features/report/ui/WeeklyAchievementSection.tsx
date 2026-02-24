"use client";

import { Bar, BarChart, Cell, ReferenceLine, ResponsiveContainer, XAxis, YAxis } from "recharts";

import { useWeeklyAchievementChart } from "@/features/report";
import { SectionCard } from "@/shared/ui";

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
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-ink-900/45 text-sm font-semibold">이번주 요약</p>
            <p className="mt-1 text-base font-semibold text-black">
              <span className="text-primary-500">{bestDay}요일</span> 달성률이 가장 높았어요
            </p>
          </div>
          <div className="bg-primary-100 rounded-xl px-3 py-2 text-right">
            <p className="text-primary-600 text-xs font-semibold">평균 달성률</p>
            <p className="text-primary-700 mt-0.5 text-base font-bold">{averageRate}%</p>
          </div>
        </div>

        <div
          ref={chartWrapRef}
          className="relative mt-4 h-[182px] w-full rounded-xl px-2 pt-2"
        >
          {selectedPoint && tooltipLeftPx !== null && tooltipTopPx !== null ? (
            <div
              className="bg-primary-200 pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-full rounded-[10px] px-2.5 py-1.5"
              style={{
                left: tooltipLeftPx,
                top: tooltipTopPx,
              }}
            >
              <p className="text-primary-500 text-base leading-none font-semibold">
                {selectedPoint.rate}
              </p>
            </div>
          ) : null}

          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <BarChart
              data={chartData}
              margin={{ top: 8, right: 8, left: 8, bottom: 32 }}
              barCategoryGap="28%"
              onMouseMove={handleChartMouseMove}
              onMouseLeave={handleChartMouseLeave}
            >
              <defs>
                <linearGradient
                  id="weeklyBarDefaultGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="rgb(255, 158, 158)"
                    stopOpacity="0.95"
                  />
                  <stop
                    offset="100%"
                    stopColor="rgb(255, 158, 158)"
                    stopOpacity="0.12"
                  />
                </linearGradient>
                <linearGradient
                  id="weeklyBarFocusGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="rgb(255, 109, 109)"
                    stopOpacity="1"
                  />
                  <stop
                    offset="100%"
                    stopColor="rgb(255, 109, 109)"
                    stopOpacity="0.16"
                  />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tickMargin={12}
              />
              <YAxis
                domain={[0, 100]}
                hide
              />
              <ReferenceLine
                y={averageRate}
                stroke="#B2B8BF"
                strokeDasharray="2 5"
              />
              <Bar
                dataKey="rate"
                maxBarSize={16}
                radius={[9, 9, 0, 0]}
                isAnimationActive
                animationDuration={850}
                animationEasing="ease-out"
                onClick={handleSelectPoint}
              >
                {cells.map((item) => (
                  <Cell
                    key={item.day}
                    fill={
                      item.day === bestDay
                        ? "url(#weeklyBarFocusGradient)"
                        : "url(#weeklyBarDefaultGradient)"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </SectionCard>
    </section>
  );
}
