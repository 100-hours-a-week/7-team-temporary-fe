import { Icon } from "@/shared/ui/icon";

interface WeekHeaderProps {
  monthIndex: number;
  onPrev: () => void;
  onNext: () => void;
}

export function WeekHeader({ monthIndex, onPrev, onNext }: WeekHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-xl font-semibold text-neutral-900">{monthIndex + 1}월</h2>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="flex h-8 w-[29px] items-center justify-center rounded-full text-neutral-900 transition hover:bg-neutral-100"
          aria-label="이전 주"
          onClick={onPrev}
        >
          <Icon
            name="prev"
            className="h-[26px] w-[26px]"
            aria-hidden="true"
            focusable="false"
          />
        </button>
        <button
          type="button"
          className="flex h-8 w-[29px] items-center justify-center rounded-full text-neutral-900 transition hover:bg-neutral-100"
          aria-label="다음 주"
          onClick={onNext}
        >
          <Icon
            name="next"
            className="h-[26px] w-[26px]"
            aria-hidden="true"
            focusable="false"
          />
        </button>
      </div>
    </div>
  );
}
