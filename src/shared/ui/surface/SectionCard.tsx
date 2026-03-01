import type { HTMLAttributes } from "react";

import { cn } from "@/shared/lib";

type SectionCardProps = HTMLAttributes<HTMLElement>;

export function SectionCard({ className, ...props }: SectionCardProps) {
  return (
    <section
      className={cn(
        "border-ink-100 rounded-[15px] border border-solid bg-white px-4 py-4",
        className,
      )}
      {...props}
    />
  );
}
