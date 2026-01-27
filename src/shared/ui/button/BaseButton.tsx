import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/shared/lib";

export interface BaseButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  loadingText?: string;
  children: ReactNode;
}

//...props : 나머지 속성을 모두 받아오면서 본인 책임의 속성만 사용
export function BaseButton({
  isLoading = false,
  loadingText,
  className,
  disabled,
  type = "button",
  children,
  ...props
}: BaseButtonProps) {
  const isDisabled = disabled || isLoading;

  return (
    <button
      disabled={isDisabled}
      className={cn(
        "inline-flex items-center justify-center gap-2",
        "rounded-md px-4 py-2 text-sm font-medium",
        "focus:ring-2 focus:ring-[var(--color-red-400)]/30 focus:outline-none",
        "disabled:bg-primary-300 disabled:cursor-not-allowed",
        className,
      )}
      type={type}
      {...props}
    >
      {isLoading ? (loadingText ?? "처리 중...") : children}
    </button>
  );
}
