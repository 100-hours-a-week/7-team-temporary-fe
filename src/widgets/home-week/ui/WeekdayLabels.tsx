import { WEEKDAY_LABELS } from "@/shared/lib";

export function WeekdayLabels() {
  return (
    <div className="mt-5 grid grid-cols-7 text-center text-[18px] font-semibold text-[#5B2B1F]">
      {WEEKDAY_LABELS.map((label) => (
        <div
          key={label}
          className="py-1"
        >
          {label}
        </div>
      ))}
    </div>
  );
}
