import { BaseButton } from "./BaseButton";
import { cn } from "@/shared/lib/utils";

interface SelectCardProps {
  title: string;
  description?: string | null;
  selected?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

export function SelectCard({
  title,
  description,
  selected = false,
  onClick,
  disabled = false,
  className,
}: SelectCardProps) {
  return (
    <BaseButton
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "h-[80px] w-full justify-center rounded-2xl px-6 text-[var(--color-neutral-800)]",
        selected ? "border border-red-400 bg-red-50" : "border border-gray-300 bg-white",
        className,
      )}
    >
      <div className="grid w-fit grid-cols-2 grid-rows-1 items-center gap-0 text-center align-middle">
        <span className="w-[60px] text-base font-bold">{title}</span>
        {description == null ? null : <span className="text-sm text-gray-500">{description}</span>}
      </div>
    </BaseButton>
  );
}
