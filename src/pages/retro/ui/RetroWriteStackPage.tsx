"use client";

import { useEffect, useMemo } from "react";

import { dayPlanQueryKeys } from "@/entities/day-plan";
import { RetroWriteForm } from "@/features/retro";
import { formatYmdDate, parseDateInput } from "@/shared/lib";
import { useStackPage } from "@/widgets/stack";

interface RetroWriteStackPageProps {
  baseDate?: string | null;
  dayPlanId?: number | null;
}

export function RetroWriteStackPage({ baseDate, dayPlanId = null }: RetroWriteStackPageProps) {
  const { setHeaderContent, pop } = useStackPage();

  const dateLabel = useMemo(() => {
    const parsedDate = parseDateInput(baseDate);
    return formatYmdDate(parsedDate, ".");
  }, [baseDate]);

  useEffect(() => {
    setHeaderContent(<span className="text-[18px] font-semibold text-black">회고 작성</span>);
    return () => setHeaderContent(null);
  }, [setHeaderContent]);

  const invalidateKeys = useMemo(
    () =>
      dayPlanQueryKeys.dayPlanScheduleCacheKeys({
        dayPlanId,
        dayPlanDate: baseDate,
      }),
    [baseDate, dayPlanId],
  );

  return (
    <RetroWriteForm
      dateLabel={dateLabel}
      dayPlanId={dayPlanId}
      invalidateKeys={invalidateKeys}
      onCreated={pop}
    />
  );
}
