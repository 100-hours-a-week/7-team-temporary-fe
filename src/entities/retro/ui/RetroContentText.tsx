"use client";

import { cn } from "@/shared/lib";

interface RetroContentTextProps {
  value: string;
  className?: string;
}

const BASE_CLASS_NAME = "w-full rounded-2xl text-sm text-black";

export function RetroContentText({ value, className }: RetroContentTextProps) {
  return (
    <div className={cn(BASE_CLASS_NAME, "min-h-[130px] whitespace-pre-wrap", className)}>
      {value}
    </div>
  );
}
