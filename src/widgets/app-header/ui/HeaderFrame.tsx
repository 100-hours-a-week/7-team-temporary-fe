import type { ReactNode } from "react";

import { cn } from "@/shared/lib";

interface HeaderFrameProps {
  leftSlot?: ReactNode;
  centerSlot?: ReactNode;
  rightSlot?: ReactNode;
  className?: string;
}

export function HeaderFrame({ leftSlot, centerSlot, rightSlot, className }: HeaderFrameProps) {
  return (
    <header
      className={cn(
        "grid h-[52px] w-full grid-cols-3 grid-cols-[auto_1fr_auto] items-center gap-x-6 px-7 py-3",
        className,
      )}
    >
      <div className="justify-self-start">{leftSlot}</div>
      <div className="w-full justify-self-center align-middle">
        {centerSlot ? <div className="flex w-full items-center">{centerSlot}</div> : null}
      </div>
      <div className="justify-self-end">{rightSlot}</div>
    </header>
  );
}
