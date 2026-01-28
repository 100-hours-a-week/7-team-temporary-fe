"use client";

import { useMemo, useState } from "react";

import {
  addDays,
  DAYS_IN_WEEK,
  END_HOUR,
  getRepresentativeMonthIndex,
  START_HOUR,
  toStartOfWeek,
} from "../model/calendar";
import type { TaskItemModel } from "../model/taskModels";
import { toTaskItemModelFromHomeTask } from "../model/taskMappers";
import { useDayPlanScheduleQuery } from "../model/useDayPlanScheduleQuery";
import { HomeTaskItem } from "./HomeTaskItem";
import { PlannerEditButton } from "./PlannerEditButton";
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

const parseHour = (time?: string) => {
  if (!time) return null;
  const [hours] = time.split(":").map(Number);
  return Number.isNaN(hours) ? null : hours;
};

export function HomePlanner({ onOpenPlannerEdit }: HomePlannerProps) {
  const today = useMemo(() => new Date(), []);
  const [weekStart, setWeekStart] = useState(() => toStartOfWeek(today));
  const [selectedDate, setSelectedDate] = useState<Date | null>(today);

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

  const tasks = useMemo(
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
  const tasksByHour = useMemo(
    () =>
      tasks.reduce<Map<number, TaskItemModel[]>>((map, task) => {
        const hour = parseHour(task.startTime);
        if (hour === null) return map;
        if (!map.has(hour)) map.set(hour, []);
        map.get(hour)?.push(task);
        return map;
      }, new Map()),
    [tasks],
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

  return (
    <div className="scrollbar-hide h-full overflow-y-auto px-6 py-8">
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

      <div className="mt-0 flex flex-col items-end justify-center">
        <PlannerEditButton onClick={onOpenPlannerEdit} />
      </div>

      <div className="mt-0 flex flex-col gap-6 pb-[152px]">
        {timeSlots.map((hour, index) => {
          const items = tasksByHour.get(hour) ?? [];

          return (
            <div
              key={hour}
              className="grid grid-cols-[64px_1fr] items-start gap-4"
            >
              <div className="text-base font-semibold text-neutral-900">
                {String(hour).padStart(2, "0")}:00
              </div>
              <div className="flex min-h-[44px] flex-col gap-3">
                {statusMessage && index === 0 ? (
                  <div className={`text-sm ${statusMessage.className}`}>{statusMessage.text}</div>
                ) : null}
                {items.map((task) => (
                  <HomeTaskItem
                    key={task.taskId}
                    task={task}
                    onToggleComplete={() => undefined}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
