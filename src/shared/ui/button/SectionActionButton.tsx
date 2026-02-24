import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/shared/lib";

import { BaseButton } from "./BaseButton";

interface SectionActionButtonProps extends Omit<ComponentProps<typeof BaseButton>, "children"> {
  icon?: ReactNode;
  children: ReactNode;
}

export function SectionActionButton({
  icon,
  className,
  children,
  ...props
}: SectionActionButtonProps) {
  return (
    <BaseButton
      className={cn(
        "text-primary-600 bg-primary-100 inline-flex cursor-pointer items-center gap-1.5 rounded-[10px] px-3 py-1 text-base font-bold transition-colors duration-150",
        "enabled:hover:bg-primary-50 enabled:hover:text-primary-300",
        "disabled:bg-neutral-100 disabled:text-neutral-400 disabled:opacity-100 disabled:saturate-0",
        className,
      )}
      {...props}
    >
      {icon}
      {children}
    </BaseButton>
  );
}
