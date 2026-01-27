import { WEEKDAY_LABELS } from "../model/calendar";

export function WeekdayLabels() {
  return (
    <div className="mt-8 grid grid-cols-7 text-center text-base font-semibold text-neutral-900">
      {WEEKDAY_LABELS.map((label) => (
        <div
          key={label}
          className="py-2"
        >
          {label}
        </div>
      ))}
    </div>
  );
}
