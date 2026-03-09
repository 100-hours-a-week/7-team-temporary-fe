import { useCallback, useMemo, useState } from "react";

import {
  addDays,
  DAYS_IN_WEEK,
  getRepresentativeMonthIndex,
  toStartOfWeek,
} from "@/features/home-core";

interface UseHomePlannerCalendarResult {
  today: Date;
  weekDays: Date[];
  headerMonthIndex: number;
  selectedDate: Date | null;
  setSelectedDate: (date: Date | null) => void;
  handleMoveWeek: (offset: number) => void;
}

export function useHomePlannerCalendar(): UseHomePlannerCalendarResult {
  const today = useMemo(() => new Date(), []);
  const [weekStart, setWeekStart] = useState(() => toStartOfWeek(today));
  const [selectedDate, setSelectedDate] = useState<Date | null>(today);

  const weekDays = useMemo(
    () => Array.from({ length: DAYS_IN_WEEK }, (_, index) => addDays(weekStart, index)),
    [weekStart],
  );
  const headerMonthIndex = selectedDate
    ? selectedDate.getMonth()
    : getRepresentativeMonthIndex(weekDays);

  const handleMoveWeek = useCallback((offset: number) => {
    setWeekStart((prev) => addDays(prev, offset));
    setSelectedDate((prev) => (prev ? addDays(prev, offset) : null));
  }, []);

  return {
    today,
    weekDays,
    headerMonthIndex,
    selectedDate,
    setSelectedDate,
    handleMoveWeek,
  };
}
