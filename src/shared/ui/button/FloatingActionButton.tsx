import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/shared/lib";
import { Icon, type IconName } from "@/shared/ui/icon";

interface FloatingActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: IconName;
  label: string;
}

export function FloatingActionButton({
  icon,
  label,
  className,
  ...props
}: FloatingActionButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      className={cn(
        "bg-ink-900 hover:bg-primary-500 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg",
        className,
      )}
      {...props}
    >
      <Icon
        name={icon}
        className="h-8 w-8"
        aria-hidden
      />
    </button>
  );
}
