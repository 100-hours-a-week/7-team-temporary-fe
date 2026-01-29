"use client";

import { useContext, useEffect, useMemo, useState } from "react";

import {
  END_HOUR,
  ExcludedTaskItem,
  START_HOUR,
  TaskBasketButton,
  TimeSlotList,
  useDayPlanId,
  useDayPlanSchedulesQuery,
} from "@/features/home";
import { ExcludedListBottomSheet } from "./ExcludedListBottomSheet";
import { StackPageEntryContext, useStackPage } from "@/widgets/stack";
import { TaskBasketStackPage } from "./TaskBasketStackPage";

export function PlannerEditStackPage() {
  const { push, setHeaderContent, stack } = useStackPage();
  const entry = useContext(StackPageEntryContext);
  const today = useMemo(() => new Date(), []);
  const queryDate = useMemo(() => formatDateParam(today), [today]);
  const { dayPlanId } = useDayPlanId({ date: queryDate, page: 1, size: 1 });
  const [isSheetOpen, setIsSheetOpen] = useState(true);
  const [isSheetExpanded, setIsSheetExpanded] = useState(false);
  const schedulesQuery = useDayPlanSchedulesQuery({
    dayPlanId: dayPlanId ?? 0,
    status: "EXCLUDED",
    page: 1,
    size: 10,
    enabled: Boolean(dayPlanId) && isSheetOpen,
  });

  const timeSlots = useMemo(
    () => Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, index) => START_HOUR + index),
    [],
  );

  useEffect(() => {
    setHeaderContent(<span className="text-xl font-semibold text-black">플래너 수정</span>);
    return () => setHeaderContent(null);
  }, [setHeaderContent]);

  const handleOpenTaskBasket = () => {
    push(<TaskBasketStackPage />);
  };

  const handleOpenExcludedList = () => {
    setIsSheetOpen(true);
    setIsSheetExpanded(false);
  };

  const excludedTasks = schedulesQuery.data?.content ?? [];
  const isTop = useMemo(() => {
    const topKey = stack[stack.length - 1]?.key ?? null;
    if (!entry?.entryKey) return stack.length === 0;
    return topKey === entry.entryKey;
  }, [entry?.entryKey, stack]);

  useEffect(() => {
    if (isTop && isSheetOpen) {
      schedulesQuery.refetch();
    }
  }, [isTop, isSheetOpen, schedulesQuery]);

  return (
    <>
      <div className="px-6 pt-[13px] pb-32">
        <div className="mb-4 text-[18px] font-semibold text-neutral-900">
          {today.getMonth() + 1}월 {today.getDate()}일{" "}
          {["일", "월", "화", "수", "목", "금", "토"][today.getDay()]}
        </div>
        <div className="flex items-start justify-end gap-2">
          <button
            type="button"
            className="rounded-full border border-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-800"
            onClick={handleOpenExcludedList}
          >
            제외리스트
          </button>
          <TaskBasketButton onClick={handleOpenTaskBasket} />
        </div>
        <div className="text-base text-neutral-500">
          <TimeSlotList slots={timeSlots} />
        </div>
      </div>

      <ExcludedListBottomSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        expanded={isSheetExpanded}
        onExpandedChange={setIsSheetExpanded}
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
          <ExcludedTaskItem
            key={task.scheduleId}
            task={task}
            onRestore={() => undefined}
          />
        ))}
      </ExcludedListBottomSheet>
    </>
  );
}

const formatDateParam = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
