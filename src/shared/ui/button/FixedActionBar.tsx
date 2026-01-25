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
        "fixed right-0 bottom-6 left-0 mx-auto flex w-full max-w-[408px] gap-2 px-4",
        className,
      )}
    >
      {children}
    </div>
  );
}
