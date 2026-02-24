import type { RefObject } from "react";
import { Bar, BarChart, Cell, ReferenceLine, ResponsiveContainer, XAxis, YAxis } from "recharts";

import type { WeeklyAchievementPoint } from "../model";
import { WeeklyAchievementTooltip } from "./WeeklyAchievementTooltip";

interface WeeklyAchievementChartProps {
  chartData: WeeklyAchievementPoint[];
  selectedPoint: WeeklyAchievementPoint | null;
  tooltipLeftPx: number | null;
  tooltipTopPx: number | null;
  chartWrapRef: RefObject<HTMLDivElement | null>;
  averageRate: number;
  bestDay: string;
  cells: WeeklyAchievementPoint[];
  onSelectPoint: (value: unknown) => void;
  onChartMouseMove: (state: unknown) => void;
  onChartMouseLeave: () => void;
}

export function WeeklyAchievementChart({
  chartData,
  selectedPoint,
  tooltipLeftPx,
  tooltipTopPx,
  chartWrapRef,
  averageRate,
  bestDay,
  cells,
  onSelectPoint,
  onChartMouseMove,
  onChartMouseLeave,
}: WeeklyAchievementChartProps) {
  return (
    <div
      ref={chartWrapRef}
      className="relative mt-4 h-[182px] w-full rounded-xl px-2 pt-2"
    >
      <WeeklyAchievementTooltip
        rate={selectedPoint?.rate ?? 0}
        left={tooltipLeftPx}
        top={tooltipTopPx}
        visible={selectedPoint !== null}
      />

      <ResponsiveContainer
        width="100%"
        height="100%"
      >
        <BarChart
          data={chartData}
          margin={{ top: 8, right: 8, left: 8, bottom: 32 }}
          barCategoryGap="28%"
          onMouseMove={onChartMouseMove}
          onMouseLeave={onChartMouseLeave}
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
            onClick={onSelectPoint}
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
  );
}
