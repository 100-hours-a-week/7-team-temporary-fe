import type { ReactNode } from "react";

import { cn } from "@/shared/lib";

interface FixedActionBarProps {
  children: ReactNode;
  className?: string;
}

/**
 * 하단 고정 액션 영역 컨테이너.
 */
export function FixedActionBar({ children, className }: FixedActionBarProps) {
  return (
    <div
      className={cn(
        "fixed right-0 bottom-[calc(1.5rem+env(safe-area-inset-bottom))] left-0 mx-auto flex w-full max-w-[408px] gap-2 px-4",
        "pointer-events-auto z-10",
        className,
      )}
    >
      {children}
    </div>
  );
}
