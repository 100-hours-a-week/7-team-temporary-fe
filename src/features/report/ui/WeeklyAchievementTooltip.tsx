interface WeeklyAchievementTooltipProps {
  rate: number;
  left: number | null;
  top: number | null;
  visible: boolean;
}

export function WeeklyAchievementTooltip({
  rate,
  left,
  top,
  visible,
}: WeeklyAchievementTooltipProps) {
  if (left === null || top === null) return null;

  return (
    <div
      className={`bg-primary-200 pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-[calc(100%+2px)] rounded-[10px] px-2.5 py-1.5 transition-opacity duration-200 ease-out ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      style={{
        left,
        top,
      }}
    >
      <p className="text-primary-500 text-base leading-none font-semibold">{rate}</p>
    </div>
  );
}
