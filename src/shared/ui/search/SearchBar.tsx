import type { InputHTMLAttributes } from "react";

import { cn } from "@/shared/lib";

interface SearchBarProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "value" | "onChange"
> {
  value: string;
  onChange: (value: string) => void;
  actionLabel?: string;
  onActionClick?: () => void;
  actionDisabled?: boolean;
}

export function SearchBar({
  value,
  onChange,
  actionLabel,
  onActionClick,
  actionDisabled = false,
  className,
  ...props
}: SearchBarProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="text-md h-11 min-w-0 flex-1 rounded-xl border border-neutral-200 bg-white px-4 text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-300 focus:outline-none"
        {...props}
      />

      {actionLabel ? (
        <button
          type="button"
          disabled={actionDisabled}
          onClick={onActionClick}
          className="h-11 shrink-0 rounded-xl bg-neutral-900 px-4 text-sm font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-400"
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
