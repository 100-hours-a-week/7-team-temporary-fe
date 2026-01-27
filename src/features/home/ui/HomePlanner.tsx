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
import { PlannerEditButton } from "./PlannerEditButton";
import { TimeSlotList } from "./TimeSlotList";
import { WeekDateSelector } from "./WeekDateSelector";
import { WeekHeader } from "./WeekHeader";
import { WeekdayLabels } from "./WeekdayLabels";

interface HomePlannerProps {
  onOpenPlannerEdit: () => void;
}

export function HomePlanner({ onOpenPlannerEdit }: HomePlannerProps) {
  const today = useMemo(() => new Date(), []);
  const [weekStart, setWeekStart] = useState(() => toStartOfWeek(today));
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

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

      <TimeSlotList slots={timeSlots} />
    </div>
  );
}
