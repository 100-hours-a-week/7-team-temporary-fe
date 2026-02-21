import { WeekDateSelector } from "./WeekDateSelector";
import { WeekHeader } from "./WeekHeader";
import { WeekdayLabels } from "./WeekdayLabels";

interface HomeWeekSelectorProps {
  monthIndex: number;
  weekDays: Date[];
  selectedDate: Date | null;
  today: Date;
  onSelectDate: (date: Date | null) => void;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  hasPlan: (date: Date) => boolean;
}

export function HomeWeekSelector({
  monthIndex,
  weekDays,
  selectedDate,
  today,
  onSelectDate,
  onPrevWeek,
  onNextWeek,
  hasPlan,
}: HomeWeekSelectorProps) {
  return (
    <>
      <WeekHeader
        monthIndex={monthIndex}
        onPrev={onPrevWeek}
        onNext={onNextWeek}
      />

      <WeekdayLabels />

      <WeekDateSelector
        weekDays={weekDays}
        selectedDate={selectedDate}
        today={today}
        onSelect={onSelectDate}
        hasPlan={hasPlan}
      />
    </>
  );
}
