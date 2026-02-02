"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/shared/lib";

interface DateSwapTextProps {
  value: string;
  delayMs?: number;
  durationMs?: number;
  className?: string;
}

export function DateSwapText({
  value,
  delayMs = 0,
  durationMs = 420,
  className,
}: DateSwapTextProps) {
  const prevRef = useRef(value);
  const [prevValue, setPrevValue] = useState<string | null>(null);
  const [nextValue, setNextValue] = useState(value);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (prevRef.current === value) return;
    setPrevValue(prevRef.current);
    setNextValue(value);
    prevRef.current = value;
    setIsAnimating(true);
  }, [value]);

  useEffect(() => {
    if (!isAnimating) return;
    const timeout = window.setTimeout(() => {
      setPrevValue(null);
      setIsAnimating(false);
    }, durationMs + delayMs);
    return () => window.clearTimeout(timeout);
  }, [delayMs, durationMs, isAnimating]);

  return (
    <span className={cn("date-swap", className)}>
      {prevValue ? (
        <span
          className="date-swap__prev"
          style={{ animationDelay: `${delayMs}ms`, animationDuration: `${durationMs}ms` }}
        >
          {prevValue}
        </span>
      ) : null}
      <span
        className={cn("date-swap__next", isAnimating && "date-swap__next--anim")}
        style={
          isAnimating
            ? { animationDelay: `${delayMs}ms`, animationDuration: `${durationMs}ms` }
            : undefined
        }
      >
        {nextValue}
      </span>
    </span>
  );
}
