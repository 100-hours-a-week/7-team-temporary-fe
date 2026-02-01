import { cn } from "@/shared/lib";
import { isSameDate } from "../model/calendar";
import { useHomePlanStore } from "../model/homePlan.store";

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
  const setDate = useHomePlanStore((state) => state.setDate);

  const handleSelectDate = (date: Date) => {
    setDate(formatDateParam(date));
    onSelect(date);
  };

  return (
    <div className="grid grid-cols-7 text-center">
      {weekDays.map((day) => {
        const isSelected = selectedDate ? isSameDate(day, selectedDate) : false;
        const isToday = isSameDate(day, today);
        const hasPlanForDay = hasPlan(day);

        return (
          <button
            key={day.toISOString()}
            type="button"
            className="flex flex-col items-center gap-1 py-1 text-[#7B7B7B]"
            onClick={() => handleSelectDate(day)}
          >
            <span
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full text-base transition",
                isSelected
                  ? "bg-[#FF6B6B] text-white"
                  : isToday
                    ? "bg-primary-100 text-[#5B2B1F]"
                    : "text-sm font-light text-[#a98a8a]",
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

function formatDateParam(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
