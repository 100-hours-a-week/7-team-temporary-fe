"use client";

import { useEffect, useRef, useState } from "react";

import { Icon } from "@/shared/ui/icon";

interface PermissionInfoTooltipProps {
  message: string;
  align?: "left" | "right";
}

export function PermissionInfoTooltip({ message, align = "left" }: PermissionInfoTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (!tooltipRef.current) return;
      if (tooltipRef.current.contains(event.target as Node)) return;
      setIsOpen(false);
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setIsOpen(false);
    };

    window.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  return (
    <div
      ref={tooltipRef}
      className="relative"
    >
      <button
        type="button"
        aria-label="수정 권한 안내"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
        className="inline-flex h-8 w-8 items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-100"
      >
        <Icon
          name="info"
          className="h-5 w-5"
        />
      </button>

      {isOpen ? (
        <div
          role="tooltip"
          className={[
            "absolute top-9 z-10 w-56 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-700",
            align === "right" ? "right-0" : "left-0",
          ].join(" ")}
        >
          {message}
        </div>
      ) : null}
    </div>
  );
}
