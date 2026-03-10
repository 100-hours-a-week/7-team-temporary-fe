import { TaskTimeSelectItem } from "./TaskTimeSelectItem";

interface TaskTimeSelectListProps {
  showArrangedLabel: boolean;
  start: {
    hourOptions: number[];
    minuteOptions: number[];
    hourValue: string;
    minuteValue: string;
    onHourChange: (value: string) => void;
    onMinuteChange: (value: string) => void;
  };
  end: {
    hourOptions: number[];
    minuteOptions: number[];
    hourValue: string;
    minuteValue: string;
    onHourChange: (value: string) => void;
    onMinuteChange: (value: string) => void;
  };
}

export function TaskTimeSelectList({ showArrangedLabel, start, end }: TaskTimeSelectListProps) {
  return (
    <div className="flex flex-col gap-2">
      {showArrangedLabel ? (
        <div className="text-sm font-semibold text-neutral-900">배치 시간</div>
      ) : null}
      <div className="flex items-center justify-between gap-3 text-base font-semibold text-neutral-900">
        <TaskTimeSelectItem
          label="시작 시간"
          hourOptions={start.hourOptions}
          minuteOptions={start.minuteOptions}
          hourValue={start.hourValue}
          minuteValue={start.minuteValue}
          onHourChange={start.onHourChange}
          onMinuteChange={start.onMinuteChange}
        />
        <span className="text-neutral-400">—</span>
        <TaskTimeSelectItem
          label="종료 시간"
          hourOptions={end.hourOptions}
          minuteOptions={end.minuteOptions}
          hourValue={end.hourValue}
          minuteValue={end.minuteValue}
          onHourChange={end.onHourChange}
          onMinuteChange={end.onMinuteChange}
        />
      </div>
    </div>
  );
}
