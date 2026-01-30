import type { CSSProperties, Key, ReactNode } from "react";
import { useMemo } from "react";

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
}

const TEN_MINUTE_BLOCK_PX = 22;
const GRID_LINE_THICKNESS_PX = 1;
const HOUR_BLOCK_MIN_HEIGHT_PX = TEN_MINUTE_BLOCK_PX * 6;
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

  return (
    <div className="mt-10 flex flex-col pb-0">
      {slots.map((hour, index) => {
        const items = tasksByHour.get(hour) ?? [];

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
