"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  addDays,
  DAYS_IN_WEEK,
  END_HOUR,
  getRepresentativeMonthIndex,
  START_HOUR,
  toStartOfWeek,
} from "../model/calendar";
import { toTaskItemModelFromHomeTask } from "../model/taskMappers";
import { useHomePlanStore } from "../model/homePlan.store";
import { useDayPlanScheduleQuery } from "../model/useDayPlanScheduleQuery";
import { HomeTaskItem } from "./HomeTaskItem";
import { TimeSlotGrid } from "./TimeSlotGrid";
import { WeekDateSelector } from "./WeekDateSelector";
import { WeekHeader } from "./WeekHeader";
import { WeekdayLabels } from "./WeekdayLabels";

interface HomePlannerProps {
  onOpenPlannerEdit: () => void;
}

const PAGE_SIZE = 10;

const formatDateParam = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export function HomePlanner({ onOpenPlannerEdit }: HomePlannerProps) {
  const today = useMemo(() => new Date(), []);
  const [weekStart, setWeekStart] = useState(() => toStartOfWeek(today));
  const [selectedDate, setSelectedDate] = useState<Date | null>(today);
  const [completionOverrides, setCompletionOverrides] = useState<Map<number, boolean>>(
    () => new Map(),
  );

  const weekDays = useMemo(
    () => Array.from({ length: DAYS_IN_WEEK }, (_, index) => addDays(weekStart, index)),
    [weekStart],
  );
  const timeSlots = useMemo(
    () => Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, index) => START_HOUR + index),
    [],
  );

  const headerMonthIndex = selectedDate
    ? selectedDate.getMonth()
    : getRepresentativeMonthIndex(weekDays);

  const queryDate = useMemo(() => formatDateParam(selectedDate ?? today), [selectedDate, today]);
  const { data, isLoading, isError } = useDayPlanScheduleQuery({
    date: queryDate,
    page: 1,
    size: PAGE_SIZE,
  });
  const setHomePlan = useHomePlanStore((state) => state.setHomePlan);

  const baseTasks = useMemo(
    () =>
      data?.content.map((task) =>
        toTaskItemModelFromHomeTask({
          scheduleId: task.scheduleId,
          title: task.title,
          status: task.status,
          startAt: task.startAt,
          endAt: task.endAt,
          type: task.type,
          isUrgent: task.isUrgent,
          assignedBy: task.assignedBy,
        }),
      ) ?? [],
    [data],
  );
  const tasks = useMemo(
    () =>
      baseTasks.map((task) => ({
        ...task,
        isCompleted: completionOverrides.get(task.taskId) ?? task.isCompleted,
      })),
    [baseTasks, completionOverrides],
  );
  const statusMessage = isLoading
    ? { text: "일정을 불러오는 중...", className: "text-neutral-500" }
    : isError
      ? { text: "일정을 불러오지 못했습니다.", className: "text-red-500" }
      : tasks.length === 0
        ? { text: "등록된 일정이 없습니다.", className: "text-neutral-500" }
        : null;

  const handleMoveWeek = (offset: number) => {
    setWeekStart((prev) => addDays(prev, offset));
    setSelectedDate((prev) => (prev ? addDays(prev, offset) : null));
  };
  const baseCompletionById = useMemo(
    () => new Map(baseTasks.map((task) => [task.taskId, task.isCompleted])),
    [baseTasks],
  );
  const handleToggleComplete = useCallback(
    (taskId: number) => {
      setCompletionOverrides((prev) => {
        const next = new Map(prev);
        const current = next.get(taskId) ?? baseCompletionById.get(taskId) ?? false;
        next.set(taskId, !current);
        return next;
      });
    },
    [baseCompletionById],
  );

  useEffect(() => {
    if (data?.dayPlanId) {
      setHomePlan(data.dayPlanId, queryDate);
    }
  }, [data?.dayPlanId, queryDate, setHomePlan]);

  return (
    <div className="scrollbar-hide mx-0 h-full overflow-y-auto px-[25px] py-[20px]">
      <WeekHeader
        monthIndex={headerMonthIndex}
        onPrev={() => handleMoveWeek(-7)}
        onNext={() => handleMoveWeek(7)}
      />

      <WeekdayLabels />

      <WeekDateSelector
        weekDays={weekDays}
        selectedDate={selectedDate}
        today={today}
        onSelect={setSelectedDate}
      />
      <TimeSlotGrid
        slots={timeSlots}
        tasks={tasks}
        statusMessage={statusMessage}
        getTaskKey={(task) => task.taskId}
        getStartTime={(task) => task.startTime}
        getEndTime={(task) => task.endTime}
        renderTask={(task, style) => (
          <HomeTaskItem
            task={task}
            style={style}
            onToggleComplete={handleToggleComplete}
          />
        )}
      />
    </div>
  );
}
