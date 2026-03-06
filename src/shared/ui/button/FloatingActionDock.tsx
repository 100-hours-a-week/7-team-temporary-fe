import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/shared/lib";

const FLOATING_ACTION_DOCK_OUTER_CLASS_NAME =
  "pointer-events-none fixed bottom-0 left-1/2 z-[60] w-full max-w-[420px] -translate-x-1/2";
const FLOATING_ACTION_DOCK_INNER_BASE_CLASS_NAME = "pointer-events-auto absolute right-5";
const FLOATING_ACTION_DOCK_DEFAULT_OFFSET_CLASS_NAME =
  "bottom-[calc(env(safe-area-inset-bottom)+110px)]";

interface FloatingActionDockProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  children: ReactNode;
  offsetClassName?: string;
  outerClassName?: string;
}

export function FloatingActionDock({
  children,
  className,
  offsetClassName = FLOATING_ACTION_DOCK_DEFAULT_OFFSET_CLASS_NAME,
  outerClassName,
  ...props
}: FloatingActionDockProps) {
  return (
    <div className={cn(FLOATING_ACTION_DOCK_OUTER_CLASS_NAME, outerClassName)}>
      <div
        className={cn(FLOATING_ACTION_DOCK_INNER_BASE_CLASS_NAME, offsetClassName, className)}
        {...props}
      >
        {children}
      </div>
    </div>
  );
}
