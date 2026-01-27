import { cn } from "@/shared/lib";
import type { ReactNode } from "react";

//FormField의 책임
//label 렌더링
//input 영역 배치
// helper / error text 출력
// 상태를 전달 (isError)

interface FormFieldProps {
  label: string;
  error?: string;
  helperText?: string;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  labelClassName?: string;
  labelAdornment?: ReactNode;
}

export function FormField({
  label,
  error,
  helperText,
  children,
  className,
  contentClassName,
  labelClassName,
  labelAdornment,
}: FormFieldProps) {
  const isError = Boolean(error); //에러가 존재할 시 : true, 없을 시 : false

  return (
    <div className={cn("flex w-full flex-col gap-1", className)}>
      <label className={cn("text-sm font-medium text-neutral-900", labelClassName)}>
        {label}
        {labelAdornment}
      </label>

      <div
        data-invalid={isError || undefined}
        className={cn("w-full", contentClassName)}
      >
        {children}
      </div>

      {(error || helperText) && (
        <p className={cn("text-xs", isError ? "text-[var(--color-red-400)]" : "text-gray-500")}>
          {error ?? helperText}
        </p>
      )}
    </div>
  );
}
