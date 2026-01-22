import type { ComponentProps } from "react";

import { cn } from "@/shared/lib";
import { BaseButton } from "./BaseButton";

export function PrimaryButton({ className, ...props }: ComponentProps<typeof BaseButton>) {
  return (
    <BaseButton
      className={cn(
        "h-12 w-full rounded-xl bg-red-400 font-bold text-white hover:bg-red-500",
        className,
      )}
      {...props}
    />
  );
}
