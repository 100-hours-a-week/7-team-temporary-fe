import type { ReactNode } from "react";

import { cn } from "@/shared/lib";

interface MyInfoFieldProps {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  className?: string;
  labelClassName?: string;
  labelWrapperClassName?: string;
  labelAdornment?: ReactNode;
  inputClassName?: string;
}

export function MyInfoField({
  label,
  value,
  onChange,
  className,
  labelClassName,
  labelWrapperClassName,
  labelAdornment,
  inputClassName,
}: MyInfoFieldProps) {
  const isControlled = typeof onChange === "function";

  return (
    <div className={cn("flex items-center justify-between gap-4", className)}>
      <div className={cn("flex items-center gap-2", labelWrapperClassName)}>
        <span className={cn("text-base font-bold text-black", labelClassName)}>{label}</span>
        {labelAdornment}
      </div>
      <input
        type="text"
        value={isControlled ? value : undefined}
        defaultValue={isControlled ? undefined : value}
        onChange={(event) => onChange?.(event.target.value)}
        className={cn(
          "min-w-[220px] rounded-full bg-white px-[27px] py-3 text-center text-[16px] font-semibold text-neutral-400",
          inputClassName,
        )}
      />
    </div>
  );
}
