import type { CSSProperties, Key, ReactNode } from "react";
import { useMemo } from "react";
import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/shared/lib";

interface TimeSlotGridStatus {
  text: string;
  className: string;
}

interface TimeSlotGridProps<T> {
  slots: number[];
  tasks?: T[];
  statusMessage?: TimeSlotGridStatus | null;
  getTaskKey: (task: T) => Key;
  getStartTime: (task: T) => string | undefined;
  getEndTime: (task: T) => string | undefined;
  renderTask: (task: T, style: CSSProperties) => ReactNode;
  enableDropTargets?: boolean;
  dropTargetIdPrefix?: string;
  previewSlot?: { hour: number; minute: number } | null;
  previewDurationMinutes?: number;
  endTimeMinutes?: number | null;
  highlightRanges?: Array<{ startMinutes: number; endMinutes: number }>;
}

const TEN_MINUTE_BLOCK_PX = 22;
const GRID_LINE_THICKNESS_PX = 1;
const GRID_LINE_COLOR = "rgba(229,231,235,1)";
const GRID_LINE_DARK_COLOR = "rgba(84,30,15,0.5)";

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

export function TimeSlotGrid<T>({
  slots,
  tasks = [],
  statusMessage,
  getTaskKey,
  getStartTime,
  getEndTime,
  renderTask,
  enableDropTargets = false,
  dropTargetIdPrefix = "planner-slot",
  previewSlot = null,
  previewDurationMinutes = 30,
  endTimeMinutes = null,
  highlightRanges = [],
}: TimeSlotGridProps<T>) {
  const tasksByHour = useMemo(
    () =>
      tasks.reduce<Map<number, T[]>>((map, task) => {
        const timeParts = parseTimeParts(getStartTime(task));
        if (!timeParts) return map;
        if (!map.has(timeParts.hour)) map.set(timeParts.hour, []);
        map.get(timeParts.hour)?.push(task);
        return map;
      }, new Map()),
    [getStartTime, tasks],
  );

  const resolvedEndMinutes = endTimeMinutes ?? 24 * 60;

  return (
    <div className="mt-2 flex flex-col pb-0">
      {slots.map((hour, index) => {
        const items = tasksByHour.get(hour) ?? [];
        const hourStartMinutes = hour * 60;
        const remainingMinutes = Math.max(0, resolvedEndMinutes - hourStartMinutes);
        const availableMinutes = Math.min(60, remainingMinutes);
        const availableStepCount = Math.floor(availableMinutes / 10);
        const hourHeight = Math.max(0, availableStepCount * TEN_MINUTE_BLOCK_PX);
        if (availableStepCount <= 0) return null;
        const hourEndMinutes = hourStartMinutes + availableMinutes;
        const highlightSegments = highlightRanges
          .map((range) => {
            const start = Math.max(hourStartMinutes, range.startMinutes);
            const end = Math.min(hourEndMinutes, range.endMinutes);
            if (end <= start) return null;
            const startOffset = start - hourStartMinutes;
            const durationMinutes = end - start;
            const top = (startOffset / 10) * TEN_MINUTE_BLOCK_PX;
            const height = Math.max(1, Math.ceil(durationMinutes / 10) * TEN_MINUTE_BLOCK_PX);
            return { top, height };
          })
          .filter((segment): segment is { top: number; height: number } => Boolean(segment));

        return (
          <div
            key={hour}
            className="relative grid grid-cols-[64px_1fr] items-start"
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
              className="relative py-0"
              style={{
                minHeight: `${hourHeight}px`,
                paddingTop: 0,
                paddingBottom: 0,
              }}
            >
              <div className="relative h-full">
                {highlightSegments.map((segment, segmentIndex) => (
                  <div
                    key={`highlight-${hour}-${segmentIndex}`}
                    className="pointer-events-none absolute right-0 left-0 bg-red-200/20"
                    style={{ top: segment.top, height: segment.height }}
                    aria-hidden
                  />
                ))}
                {statusMessage && index === 0 ? (
                  <div className={`text-sm ${statusMessage.className}`}>{statusMessage.text}</div>
                ) : null}
                {enableDropTargets
                  ? Array.from({ length: availableStepCount }, (_, step) => {
                      const minute = step * 10;
                      const top = step * TEN_MINUTE_BLOCK_PX;
                      return (
                        <TimeSlotDropTarget
                          key={`${hour}-${minute}`}
                          id={`${dropTargetIdPrefix}-${hour}-${minute}`}
                          hour={hour}
                          minute={minute}
                          top={top}
                          height={TEN_MINUTE_BLOCK_PX}
                        />
                      );
                    })
                  : null}
                {previewSlot && previewSlot.hour === hour ? (
                  <div
                    className="bg-primary-200/40 pointer-events-none absolute right-0 left-0 z-0 rounded-xl"
                    style={{
                      top: (previewSlot.minute / 10) * TEN_MINUTE_BLOCK_PX,
                      height: Math.max(
                        TEN_MINUTE_BLOCK_PX,
                        Math.ceil(previewDurationMinutes / 10) * TEN_MINUTE_BLOCK_PX,
                      ),
                    }}
                    aria-hidden
                  />
                ) : null}
                {items.map((task) => {
                  const startTime = getStartTime(task);
                  const endTime = getEndTime(task);
                  const timeParts = parseTimeParts(startTime);
                  const minuteStep = timeParts ? getTenMinuteStep(timeParts.minute) : 0;
                  const durationMinutes = getDurationMinutes(startTime, endTime);
                  const blockCount = durationMinutes
                    ? Math.max(1, Math.ceil(durationMinutes / 10))
                    : 1;
                  const height = blockCount * TEN_MINUTE_BLOCK_PX;
                  const top = minuteStep * TEN_MINUTE_BLOCK_PX;

                  return (
                    <div
                      key={getTaskKey(task)}
                      className="absolute right-0 left-0 z-10"
                      style={{ top }}
                    >
                      {renderTask(task, { height })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TimeSlotDropTarget({
  id,
  hour,
  minute,
  top,
  height,
}: {
  id: string;
  hour: number;
  minute: number;
  top: number;
  height: number;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: { type: "slot", hour, minute },
  });

  return (
    <div
      ref={setNodeRef}
      className={cn("pointer-events-none absolute right-0 left-0", isOver && "bg-primary-100/40")}
      style={{ top, height }}
      aria-hidden
    />
  );
}
