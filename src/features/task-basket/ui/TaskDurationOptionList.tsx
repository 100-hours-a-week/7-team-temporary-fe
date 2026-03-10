import { TASK_DURATION_OPTIONS, type TaskDurationOption } from "@/shared/validation";

import { TaskDurationOptionItem } from "./TaskDurationOptionItem";

interface TaskDurationOptionListProps {
  value: TaskDurationOption | null;
  errorMessage?: string;
  onChange: (value: TaskDurationOption) => void;
}

export function TaskDurationOptionList({
  value,
  errorMessage,
  onChange,
}: TaskDurationOptionListProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="text-sm font-semibold text-neutral-900">예상 소요 시간</div>
      <div className="flex flex-wrap gap-3 text-center text-[var(--color-gray-300)]">
        {TASK_DURATION_OPTIONS.map((option) => (
          <TaskDurationOptionItem
            key={option}
            option={option}
            isSelected={value === option}
            onSelect={onChange}
          />
        ))}
      </div>
      {errorMessage ? <p className="text-xs text-[var(--color-red-400)]">{errorMessage}</p> : null}
    </div>
  );
}
