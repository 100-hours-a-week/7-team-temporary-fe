import type { TaskItemModel } from "../model/taskModels";
import { HomeTaskItem } from "./HomeTaskItem";

interface TimeSlotListProps {
  slots: number[];
  tasks?: TaskItemModel[];
  onToggleComplete?: (taskId: number) => void;
}

const parseHour = (time?: string) => {
  if (!time) return null;
  const [hours] = time.split(":").map(Number);
  return Number.isNaN(hours) ? null : hours;
};

export function TimeSlotList({ slots, tasks = [], onToggleComplete }: TimeSlotListProps) {
  const tasksByHour = tasks.reduce<Map<number, TaskItemModel[]>>((map, task) => {
    const hour = parseHour(task.startTime);
    if (hour === null) return map;
    if (!map.has(hour)) map.set(hour, []);
    map.get(hour)?.push(task);
    return map;
  }, new Map());

  return (
    <div className="mt-0 flex flex-col gap-6 pb-[152px]">
      {slots.map((hour) => {
        const items = tasksByHour.get(hour) ?? [];

        return (
          <div
            key={hour}
            className="grid grid-cols-[64px_1fr] items-start gap-4"
          >
            <div className="pt-1 text-base font-semibold text-neutral-900">
              {String(hour).padStart(2, "0")}:00
            </div>
            <div className="flex min-h-[44px] flex-col gap-3">
              {items.map((task) => (
                <HomeTaskItem
                  key={task.taskId}
                  task={task}
                  onToggleComplete={onToggleComplete ?? (() => undefined)}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
