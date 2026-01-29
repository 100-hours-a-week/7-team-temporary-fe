"use client";

import { useCallback, useMemo, useState } from "react";

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
const TEN_MINUTE_BLOCK_PX = 22;
const GRID_LINE_THICKNESS_PX = 1;
const TEN_MINUTE_LINE_OFFSET_PX = TEN_MINUTE_BLOCK_PX - GRID_LINE_THICKNESS_PX;
const HOUR_BLOCK_MIN_HEIGHT_PX = TEN_MINUTE_BLOCK_PX * 6;
const GRID_LINE_COLOR = "rgba(229,231,235,1)";
const GRID_LINE_DARK_COLOR = "rgba(84,30,15,0.5)";

const formatDateParam = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const parseTimeParts = (time?: string) => {
  if (!time) return null;
  const [hourText, minuteText] = time.split(":");
  const hour = Number(hourText);
  const minute = Number(minuteText);
  if (Number.isNaN(hour) || Number.isNaN(minute)) return null;
  return { hour, minute };
};

const getTenMinuteStep = (minute: number) => Math.floor(minute / 10);
const getDurationMinutes = (start?: string, end?: string) => {
  const startParts = parseTimeParts(start);
  const endParts = parseTimeParts(end);
  if (!startParts || !endParts) return null;
  const startMinutes = startParts.hour * 60 + startParts.minute;
  const endMinutes = endParts.hour * 60 + endParts.minute;
  if (endMinutes <= startMinutes) return null;
  return endMinutes - startMinutes;
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
  const tasksByHour = useMemo(
    () =>
      tasks.reduce<Map<number, TaskItemModel[]>>((map, task) => {
        const timeParts = parseTimeParts(task.startTime);
        if (!timeParts) return map;
        if (!map.has(timeParts.hour)) map.set(timeParts.hour, []);
        map.get(timeParts.hour)?.push(task);
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
              className="relative grid grid-cols-[64px_1fr] items-start gap-4"
            >
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  backgroundImage: `linear-gradient(to bottom, ${GRID_LINE_DARK_COLOR} ${GRID_LINE_THICKNESS_PX}px, transparent ${GRID_LINE_THICKNESS_PX}px), linear-gradient(to bottom, ${GRID_LINE_COLOR} ${GRID_LINE_THICKNESS_PX}px, transparent ${GRID_LINE_THICKNESS_PX}px)`,
                  backgroundSize: `100% 100%, 100% ${TEN_MINUTE_BLOCK_PX}px`,
                }}
              />
              <div className="relative z-10 text-base font-semibold text-neutral-900">
                {String(hour).padStart(2, "0")}:00
              </div>
              <div
                className="relative z-10 py-0"
                style={{
                  minHeight: `${HOUR_BLOCK_MIN_HEIGHT_PX}px`,
                  paddingTop: 0,
                  paddingBottom: 0,
                }}
              >
                <div className="relative h-full">
                  {statusMessage && index === 0 ? (
                    <div className={`text-sm ${statusMessage.className}`}>{statusMessage.text}</div>
                  ) : null}
                  {items.map((task) => {
                    const timeParts = parseTimeParts(task.startTime);
                    const minuteStep = timeParts ? getTenMinuteStep(timeParts.minute) : 0;
                    const top = minuteStep * TEN_MINUTE_BLOCK_PX;
                    const durationMinutes = getDurationMinutes(task.startTime, task.endTime);
                    const blockCount = durationMinutes
                      ? Math.max(1, Math.ceil(durationMinutes / 10))
                      : 1;
                    const height = blockCount * TEN_MINUTE_BLOCK_PX;

                    return (
                      <div
                        key={task.taskId}
                        className="absolute right-0 left-0"
                        style={{ top }}
                      >
                        <HomeTaskItem
                          task={task}
                          style={{ height }}
                          onToggleComplete={handleToggleComplete}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
