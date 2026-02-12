"use client";

import { cn } from "@/shared/lib";

interface RetroVisibilityToggleProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  publicLabel?: string;
  privateLabel?: string;
  className?: string;
}

export function RetroVisibilityToggle({
  checked,
  onCheckedChange,
  publicLabel = "전체 공개",
  privateLabel = "비공개",
  className,
}: RetroVisibilityToggleProps) {
  const label = checked ? publicLabel : privateLabel;

  return (
    <button
      type="button"
      aria-label="공개 범위 토글"
      aria-pressed={checked}
      onClick={() => onCheckedChange(!checked)}
      className={cn("flex items-center gap-2", className)}
    >
      <span
        className={`relative h-6 w-11 rounded-full border transition-colors ${
          checked ? "border-[#541e0f] bg-[#541e0f]" : "border-[#541e0f] bg-white"
        }`}
      >
        <span
          className={`absolute top-[3px] left-[3px] h-4 w-4 rounded-full transition-transform ${
            checked ? "translate-x-5 bg-white" : "translate-x-0 bg-[#541e0f]"
          }`}
        />
      </span>
      <span className="text-[14px] font-semibold text-[#541e0f]">{label}</span>
    </button>
  );
}
