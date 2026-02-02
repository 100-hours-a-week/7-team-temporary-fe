"use client";

import AnimatedContent from "@/shared/ui/AnimatedContent";
import { Icon } from "@/shared/ui";
import type { Toast } from "./types";

interface ToastMessageProps {
  toast: Toast;
}

export function ToastMessage({ toast }: ToastMessageProps) {
  const toastClassName = "mx-5 bg-secondary-200 text-secondary-600";
  const disappearDuration = 0.25;
  const disappearAfter = Math.max(0, toast.duration / 1000 - disappearDuration);

  return (
    <AnimatedContent
      className={`${toastClassName} flex items-center gap-2 rounded-2xl px-4 py-4 text-sm font-medium`}
      container={undefined}
      distance={12}
      duration={0.35}
      initialOpacity={0}
      animateOpacity
      disappearAfter={disappearAfter}
      disappearDuration={disappearDuration}
      disappearDirection="up"
      onComplete={undefined}
      onDisappearanceComplete={undefined}
      useScrollTrigger={false}
    >
      {toast.type === "error" && (
        <Icon
          name="error"
          className="ml-2 h-5 w-5 shrink-0"
          aria-hidden
        />
      )}
      {toast.type === "info" && (
        <Icon
          name="info"
          className="ml-2 h-5 w-5 shrink-0"
          aria-hidden
        />
      )}
      {toast.type === "success" && (
        <Icon
          name="success"
          className="ml-2 h-5 w-5 shrink-0"
          aria-hidden
        />
      )}
      <span>{toast.message}</span>
    </AnimatedContent>
  );
}
