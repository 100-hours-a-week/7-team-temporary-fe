"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { WeeklyAchievementPoint } from "./types";
import { WEEKLY_ACHIEVEMENT_ZERO } from "./weeklyAchievement.constants";

const TOOLTIP_GAP_PX = 8;
const INITIAL_TOOLTIP_SHOW_DELAY_MS = 300;
const INITIAL_TOOLTIP_ALIGN_DURATION_MS = 900;

const toWeeklyPoint = (value: unknown): WeeklyAchievementPoint | null => {
  if (!value || typeof value !== "object") return null;

  const source = value as Record<string, unknown>;
  const payload =
    source.payload && typeof source.payload === "object"
      ? (source.payload as Record<string, unknown>)
      : source;

  if (typeof payload.day !== "string" || typeof payload.rate !== "number") return null;
  return { day: payload.day, rate: payload.rate };
};

interface UseWeeklyAchievementChartOptions {
  points: WeeklyAchievementPoint[];
}

export function useWeeklyAchievementChart({ points }: UseWeeklyAchievementChartOptions) {
  const sourcePoints = useMemo(
    () => (points.length > 0 ? points : WEEKLY_ACHIEVEMENT_ZERO),
    [points],
  );
  const [chartData, setChartData] = useState(WEEKLY_ACHIEVEMENT_ZERO);
  const [selectedPoint, setSelectedPoint] = useState<WeeklyAchievementPoint | null>(null);
  const [tooltipLeftPx, setTooltipLeftPx] = useState<number | null>(null);
  const [tooltipTopPx, setTooltipTopPx] = useState<number | null>(null);
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const [isTooltipPinned, setIsTooltipPinned] = useState(false);
  const [needsInitialTooltipTracking, setNeedsInitialTooltipTracking] = useState(false);
  const chartWrapRef = useRef<HTMLDivElement>(null);

  const maxRate = useMemo(() => Math.max(...sourcePoints.map((item) => item.rate)), [sourcePoints]);
  const bestDay = useMemo(
    () => sourcePoints.find((item) => item.rate === maxRate)?.day ?? "월",
    [maxRate, sourcePoints],
  );
  const averageRate = useMemo(
    () =>
      Math.floor(
        sourcePoints.reduce((sum, item) => sum + item.rate, 0) / Math.max(sourcePoints.length, 1),
      ),
    [sourcePoints],
  );
  const defaultPoint = useMemo<WeeklyAchievementPoint>(
    () => ({ day: bestDay, rate: maxRate }),
    [bestDay, maxRate],
  );

  useEffect(() => {
    let tooltipDelayTimer: ReturnType<typeof setTimeout> | null = null;
    const frame = requestAnimationFrame(() => {
      setChartData(sourcePoints);
      setSelectedPoint(defaultPoint);
      setTooltipLeftPx(null);
      setTooltipTopPx(null);
      setIsTooltipVisible(false);
      setIsTooltipPinned(false);
      setNeedsInitialTooltipTracking(true);
      tooltipDelayTimer = setTimeout(() => {
        setIsTooltipVisible(true);
      }, INITIAL_TOOLTIP_SHOW_DELAY_MS);
    });

    return () => {
      cancelAnimationFrame(frame);
      if (tooltipDelayTimer) clearTimeout(tooltipDelayTimer);
    };
  }, [defaultPoint, sourcePoints]);

  const alignTooltipToDay = useCallback(
    (day: string) => {
      const wrap = chartWrapRef.current;
      if (!wrap) return;

      const dayIndex = sourcePoints.findIndex((item) => item.day === day);
      if (dayIndex < 0) return;

      const wrapRect = wrap.getBoundingClientRect();
      const barNodes = wrap.querySelectorAll<SVGElement>(
        ".recharts-bar-rectangle path, .recharts-bar-rectangle rect",
      );
      const targetBar = barNodes.item(dayIndex);

      if (targetBar) {
        const barRect = targetBar.getBoundingClientRect();
        setTooltipLeftPx(barRect.left + barRect.width / 2 - wrapRect.left);
        setTooltipTopPx(barRect.top - wrapRect.top - TOOLTIP_GAP_PX);
        return;
      }

      const tickGroups = wrap.querySelectorAll<SVGGElement>("g.recharts-cartesian-axis-tick");
      const targetTick = tickGroups.item(dayIndex);
      const textNode = targetTick?.querySelector("text");

      if (!textNode) return;
      const textRect = textNode.getBoundingClientRect();
      setTooltipLeftPx(textRect.left + textRect.width / 2 - wrapRect.left);
      setTooltipTopPx(TOOLTIP_GAP_PX);
    },
    [sourcePoints],
  );

  const handleSelectPoint = useCallback(
    (value: unknown) => {
      const point = toWeeklyPoint(value);
      if (!point) return;
      setIsTooltipPinned(true);
      setNeedsInitialTooltipTracking(false);
      setIsTooltipVisible(true);
      setSelectedPoint(point);
      alignTooltipToDay(point.day);
    },
    [alignTooltipToDay],
  );

  const handleChartMouseMove = useCallback(
    (state: unknown) => {
      if (isTooltipPinned) return;
      if (!state || typeof state !== "object") return;

      const payload = (state as { activePayload?: Array<{ payload?: unknown }> }).activePayload?.[0]
        ?.payload;
      const point = toWeeklyPoint(payload);
      if (!point) return;
      setNeedsInitialTooltipTracking(false);
      setIsTooltipVisible(true);
      setSelectedPoint(point);
      alignTooltipToDay(point.day);
    },
    [alignTooltipToDay, isTooltipPinned],
  );

  const handleChartMouseLeave = useCallback(() => {
    if (isTooltipPinned) return;
    setSelectedPoint(null);
    setTooltipLeftPx(null);
    setTooltipTopPx(null);
    setIsTooltipVisible(false);
  }, [isTooltipPinned]);

  useEffect(() => {
    if (!selectedPoint) return;
    alignTooltipToDay(selectedPoint.day);
    const frame = requestAnimationFrame(() => {
      alignTooltipToDay(selectedPoint.day);
    });

    return () => cancelAnimationFrame(frame);
  }, [alignTooltipToDay, selectedPoint]);

  useEffect(() => {
    if (!needsInitialTooltipTracking) return;
    if (!selectedPoint) return;
    if (isTooltipPinned) return;

    const startedAt = performance.now();
    let frameId = 0;

    const track = (now: number) => {
      alignTooltipToDay(selectedPoint.day);

      if (now - startedAt < INITIAL_TOOLTIP_ALIGN_DURATION_MS) {
        frameId = requestAnimationFrame(track);
        return;
      }

      setNeedsInitialTooltipTracking(false);
    };

    frameId = requestAnimationFrame(track);

    return () => cancelAnimationFrame(frameId);
  }, [alignTooltipToDay, isTooltipPinned, needsInitialTooltipTracking, selectedPoint]);

  return {
    chartData,
    selectedPoint,
    isTooltipVisible,
    tooltipLeftPx,
    tooltipTopPx,
    chartWrapRef,
    bestDay,
    averageRate,
    maxRate,
    cells: sourcePoints,
    handleSelectPoint,
    handleChartMouseMove,
    handleChartMouseLeave,
  };
}
