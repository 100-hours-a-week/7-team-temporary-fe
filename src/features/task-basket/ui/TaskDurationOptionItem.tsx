import type { TaskDurationOption } from "@/shared/validation";

interface TaskDurationOptionItemProps {
  option: TaskDurationOption;
  isSelected: boolean;
  onSelect: (option: TaskDurationOption) => void;
}

export function TaskDurationOptionItem({
  option,
  isSelected,
  onSelect,
}: TaskDurationOptionItemProps) {
  return (
    <button
      type="button"
      className={`rounded-full px-4 py-2 text-sm font-semibold ${
        isSelected ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-700"
      }`}
      onClick={() => onSelect(option)}
    >
      {option}
    </button>
  );
}
