import { cn } from "@/shared/lib";
import { isSameDate } from "../model/calendar";

interface WeekDateSelectorProps {
  weekDays: Date[];
  selectedDate: Date | null;
  today: Date;
  onSelect: (date: Date) => void;
  hasPlan: (date: Date) => boolean;
}

export function WeekDateSelector({
  weekDays,
  selectedDate,
  today,
  onSelect,
  hasPlan,
}: WeekDateSelectorProps) {
  return (
    <div className="mt-1 grid grid-cols-7 text-center">
      {weekDays.map((day) => {
        const isSelected = selectedDate ? isSameDate(day, selectedDate) : false;
        const isToday = isSameDate(day, today);
        const hasPlanForDay = hasPlan(day);

        return (
          <button
            key={day.toISOString()}
            type="button"
            className="flex flex-col items-center gap-3 py-2 text-[#7B7B7B]"
            onClick={() => onSelect(day)}
          >
            <span
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full text-base font-semibold transition",
                isSelected
                  ? "bg-[#FF6B6B] text-white"
                  : isToday
                    ? "bg-primary-100 text-[#5B2B1F]"
                    : "text-[#7B7B7B]",
              )}
            >
              {day.getDate()}
            </span>
            <span
              className={cn(
                "h-2 w-2 rounded-full",
                hasPlanForDay ? "bg-[#F4D4C2]" : "bg-transparent",
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
