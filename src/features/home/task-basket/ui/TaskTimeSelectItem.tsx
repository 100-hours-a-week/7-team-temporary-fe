interface TaskTimeSelectItemProps {
  label: string;
  hourOptions: number[];
  minuteOptions: number[];
  hourValue: string;
  minuteValue: string;
  onHourChange: (value: string) => void;
  onMinuteChange: (value: string) => void;
}

export function TaskTimeSelectItem({
  label,
  hourOptions,
  minuteOptions,
  hourValue,
  minuteValue,
  onHourChange,
  onMinuteChange,
}: TaskTimeSelectItemProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="sr-only">{label}</span>
      <select
        className="h-11 rounded-xl border border-neutral-200 bg-neutral-50 px-3 text-sm text-neutral-900"
        value={hourValue}
        onChange={(event) => onHourChange(event.target.value)}
      >
        <option value="">시</option>
        {hourOptions.map((hour) => (
          <option
            key={hour}
            value={hour}
          >
            {hour}시
          </option>
        ))}
      </select>
      <select
        className="h-11 rounded-xl border border-neutral-200 bg-neutral-50 px-3 text-sm text-neutral-900"
        value={minuteValue}
        onChange={(event) => onMinuteChange(event.target.value)}
      >
        <option value="">분</option>
        {minuteOptions.map((minute) => (
          <option
            key={minute}
            value={minute}
          >
            {minute}분
          </option>
        ))}
      </select>
    </div>
  );
}
