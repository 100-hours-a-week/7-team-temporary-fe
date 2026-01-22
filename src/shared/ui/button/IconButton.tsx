import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/shared/lib/utils";
import { Icon, type IconName } from "@/shared/ui/icon";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: IconName;
  label: string;
}

export function IconButton({ icon, label, className, ...props }: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex items-center justify-center",
        "rounded-md",
        "focus:ring-error/30 focus:ring-2 focus:outline-none",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <Icon
        name={icon}
        className="h-fit w-fit flex-wrap items-center justify-center text-center"
        aria-hidden="true"
        focusable="false"
      />
    </button>
  );
}
