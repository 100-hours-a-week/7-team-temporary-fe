"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/shared/lib";

interface RetroContentTextProps {
  value: string;
  className?: string;
  expandable?: boolean;
}

const BASE_CLASS_NAME = "w-full text-sm text-black whitespace-pre-wrap";

export function RetroContentText({ value, className, expandable = false }: RetroContentTextProps) {
  const textRef = useRef<HTMLDivElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const el = textRef.current;
    if (!el || !expandable) return;
    setIsOverflowing(el.scrollHeight > el.clientHeight);
  }, [value, expandable]);

  if (!expandable) {
    return <div className={cn(BASE_CLASS_NAME, "h-[60px]", className)}>{value}</div>;
  }

  return (
    <div className={className}>
      <div
        ref={textRef}
        className={cn(BASE_CLASS_NAME, isExpanded ? "h-auto" : "h-[60px] overflow-hidden")}
      >
        {value}
      </div>
      {isOverflowing ? (
        <button
          type="button"
          onClick={() => setIsExpanded((prev) => !prev)}
          className="mt-1 text-xs font-medium text-neutral-400"
        >
          {isExpanded ? "간단하게 보기" : "더보기"}
        </button>
      ) : null}
    </div>
  );
}
