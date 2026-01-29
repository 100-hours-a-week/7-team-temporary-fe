"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/shared/lib/utils";

type BottomSheetProps = {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  peekHeight?: number;
  expandHeight?: number;
  heightUnit?: "vh" | "px";
  expanded?: boolean;
  defaultExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  enableDragHandle?: boolean;
  handleClassName?: string;
  className?: string;
  sheetClassName?: string;
  children: React.ReactNode;
};

export function BottomSheet({
  open,
  onOpenChange,
  peekHeight = 30,
  expandHeight = 80,
  heightUnit = "vh",
  expanded,
  defaultExpanded = false,
  onExpandedChange,
  enableDragHandle = false,
  handleClassName,
  className,
  sheetClassName,
  children,
}: BottomSheetProps) {
  const sheetOffsetPx = 8;
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
  const [dragHeight, setDragHeight] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isPresented, setIsPresented] = useState(false);
  const dragStartRef = useRef<{ startY: number; startHeight: number } | null>(null);

  const isControlled = expanded !== undefined;
  const isExpanded = isControlled ? expanded : internalExpanded;

  const setExpanded = (next: boolean) => {
    if (!isControlled) {
      setInternalExpanded(next);
    }
    onExpandedChange?.(next);
  };

  useEffect(() => {
    if (!open) {
      setDragHeight(null);
      setIsDragging(false);
      dragStartRef.current = null;
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onOpenChange?.(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onOpenChange]);

  useEffect(() => {
    if (!open) {
      setIsPresented(false);
      return;
    }

    setIsPresented(false);
    const frame = requestAnimationFrame(() => setIsPresented(true));
    return () => cancelAnimationFrame(frame);
  }, [open]);

  if (!open) return null;

  const baseHeight = isExpanded ? expandHeight : peekHeight;
  const visibleHeight = dragHeight ?? baseHeight;
  const midpoint = (peekHeight + expandHeight) / 2;
  const sheetTransform = isPresented
    ? `translateY(${sheetOffsetPx}px)`
    : `translateY(calc(100% + ${sheetOffsetPx}px))`;

  const handlePointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    dragStartRef.current = { startY: event.clientY, startHeight: visibleHeight };
    setIsDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!dragStartRef.current) return;
    const deltaPx = dragStartRef.current.startY - event.clientY;
    const deltaHeight = heightUnit === "vh" ? (deltaPx / window.innerHeight) * 100 : deltaPx;
    const nextHeight = Math.min(
      expandHeight,
      Math.max(peekHeight, dragStartRef.current.startHeight + deltaHeight),
    );
    setDragHeight(nextHeight);
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!dragStartRef.current) return;
    event.currentTarget.releasePointerCapture(event.pointerId);
    const finalHeight = dragHeight ?? dragStartRef.current.startHeight;
    setExpanded(finalHeight >= midpoint);
    setDragHeight(null);
    setIsDragging(false);
    dragStartRef.current = null;
  };

  return (
    <div className={cn("pointer-events-none fixed inset-x-0 bottom-0 z-40", className)}>
      <div
        className={cn(
          "mx-auto w-full max-w-[420px] rounded-t-2xl bg-white shadow-[0_4px_20px_rgba(0,0,0,0.15)]",
          "relative z-40",
          "pointer-events-auto transition-[height,transform] duration-300 ease-out will-change-transform",
          isDragging && "transition-none",
          sheetClassName,
        )}
        style={{ height: `${visibleHeight}${heightUnit}`, transform: sheetTransform }}
      >
        {enableDragHandle && (
          <button
            type="button"
            aria-label="바텀 시트 드래그 핸들"
            className={cn("mx-auto block w-full touch-none p-2.5", handleClassName)}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onClick={() => setExpanded(!isExpanded)}
          >
            <span className="mx-auto block h-1.5 w-12 rounded-full bg-neutral-300" />
          </button>
        )}
        {children}
      </div>
    </div>
  );
}
