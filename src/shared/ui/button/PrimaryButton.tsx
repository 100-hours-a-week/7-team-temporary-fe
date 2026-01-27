import type { ComponentProps } from "react";

import { cn } from "@/shared/lib";
import { BaseButton } from "./BaseButton";

export function PrimaryButton({ className, ...props }: ComponentProps<typeof BaseButton>) {
  return (
    <BaseButton
      className={cn(
        "bg-primary-600 hover:bg-primary-500 h-12 w-full rounded-xl font-bold text-white",
        className,
      )}
      {...props}
    />
  );
}
