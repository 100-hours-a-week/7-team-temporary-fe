import { cn } from "@/shared/lib";
import { isSameDate } from "../model/calendar";

interface WeekDateSelectorProps {
  weekDays: Date[];
  selectedDate: Date | null;
  today: Date;
  onSelect: (date: Date) => void;
}

export function WeekDateSelector({
  weekDays,
  selectedDate,
  today,
  onSelect,
}: WeekDateSelectorProps) {
  return (
    <div className="mt-0 grid grid-cols-7 text-center">
      {weekDays.map((day) => {
        const isSelected = selectedDate ? isSameDate(day, selectedDate) : false;
        const isToday = isSameDate(day, today);

        return (
          <button
            key={day.toISOString()}
            type="button"
            className="flex flex-col items-center gap-2 py-2 text-neutral-500"
            onClick={() => onSelect(day)}
          >
            <span
              className={cn(
                "flex h-11 w-11 items-center justify-center rounded-full text-base font-semibold transition",
                isSelected ? "bg-neutral-200 text-neutral-900" : "text-neutral-500",
                isToday && "ring-2 ring-neutral-900/20",
              )}
            >
              {day.getDate()}
            </span>
            <span
              className={cn("h-2 w-2 rounded-full", isToday ? "bg-neutral-300" : "bg-transparent")}
            />
          </button>
        );
      })}
    </div>
  );
}
