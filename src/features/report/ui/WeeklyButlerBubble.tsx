import type { HTMLAttributes, PropsWithChildren } from "react";

import { cn } from "@/shared/lib";

interface WeeklyButlerBubbleProps extends PropsWithChildren {
  className?: string;
  contentClassName?: string;
}

function WeeklyButlerBubbleBase({
  className,
  contentClassName,
  children,
}: WeeklyButlerBubbleProps) {
  return (
    <div className={cn("max-w-[88%] rounded-3xl px-5 py-3.5", className)}>
      <div className={cn("text-sm leading-relaxed", contentClassName)}>{children}</div>
    </div>
  );
}

export function WeeklyButlerBotBubble({ className, children }: WeeklyButlerBubbleProps) {
  return (
    <WeeklyButlerBubbleBase
      className={cn("bg-neutral-100 text-neutral-700", className)}
      contentClassName="space-y-2"
    >
      {children}
    </WeeklyButlerBubbleBase>
  );
}

export function WeeklyButlerUserBubble({ className, children }: WeeklyButlerBubbleProps) {
  return (
    <WeeklyButlerBubbleBase
      className={cn("border-ink-100 border bg-white text-neutral-800 shadow-sm", className)}
      contentClassName="font-semibold text-neutral-900"
    >
      {children}
    </WeeklyButlerBubbleBase>
  );
}

interface WeeklyButlerAvatarProps extends HTMLAttributes<HTMLSpanElement> {
  emoji: string;
}

export function WeeklyButlerAvatar({ emoji, className, ...props }: WeeklyButlerAvatarProps) {
  return (
    <span
      className={cn(
        "border-ink-100 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border bg-white text-base",
        className,
      )}
      aria-hidden
      {...props}
    >
      {emoji}
    </span>
  );
}
