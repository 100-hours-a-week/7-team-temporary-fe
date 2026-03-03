"use client";

import { useEffect, useMemo } from "react";
import { type EditableTaskItemModel, useDayPlanSchedulesQuery } from "@/entities/day-plan-schedule";

import { DraggableExcludedTaskItem } from "./DraggableExcludedTaskItem";
import { ExcludedListBottomSheet } from "./ExcludedListBottomSheet";

type ExcludedTasksSheetProps = {
  dayPlanId: number | null;
  isTop: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
};

export function ExcludedTasksSheet({
  dayPlanId,
  isTop,
  open,
  onOpenChange,
  expanded,
  onExpandedChange,
}: ExcludedTasksSheetProps) {
  const schedulesQuery = useDayPlanSchedulesQuery({
    dayPlanId: dayPlanId ?? 0,
    status: "EXCLUDED",
    page: 1,
    size: 10,
    enabled: Boolean(dayPlanId) && open,
  });
  const excludedTasks = useMemo(
    () => (schedulesQuery.data?.content ?? []) as EditableTaskItemModel[],
    [schedulesQuery.data],
  );

  useEffect(() => {
    if (!isTop || !open) return;
    schedulesQuery.refetch();
  }, [isTop, open, schedulesQuery]);

  return (
    <ExcludedListBottomSheet
      open={open}
      onOpenChange={onOpenChange}
      expanded={expanded}
      onExpandedChange={onExpandedChange}
    >
      {schedulesQuery.isLoading ? (
        <div className="py-6 text-center text-sm text-neutral-400">
          제외된 작업을 불러오는 중...
        </div>
      ) : null}
      {schedulesQuery.isError ? (
        <div className="py-6 text-center text-sm text-neutral-400">
          제외된 작업을 불러오지 못했습니다.
        </div>
      ) : null}
      {!schedulesQuery.isLoading && !schedulesQuery.isError && excludedTasks.length === 0 ? (
        <div className="py-6 text-center text-sm text-neutral-400">제외된 작업이 없습니다.</div>
      ) : null}
      {excludedTasks.map((task) => (
        <DraggableExcludedTaskItem
          key={task.scheduleId}
          task={task}
        />
      ))}
    </ExcludedListBottomSheet>
  );
}
