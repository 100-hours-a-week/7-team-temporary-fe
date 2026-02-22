"use client";

import { useCallback, useMemo, useRef, type KeyboardEvent, type WheelEvent } from "react";

import { cn } from "@/shared/lib";

interface HorizontalImageAlbumProps {
  imageUrls: string[];
  tileSize?: number;
  imageAltPrefix?: string;
  scrollAreaLabel?: string;
  enableKeyboardScroll?: boolean;
  className?: string;
}

export function HorizontalImageAlbum({
  imageUrls,
  tileSize = 160,
  imageAltPrefix = "이미지 미리보기",
  scrollAreaLabel = "이미지 가로 스크롤 영역",
  enableKeyboardScroll = true,
  className,
}: HorizontalImageAlbumProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const tileStyle = { width: `${tileSize}px`, height: `${tileSize}px` };
  const keyboardScrollStep = useMemo(() => Math.max(80, tileSize / 2), [tileSize]);

  const scrollByOffset = useCallback((offset: number) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
  }, []);

  const handleWheel = useCallback(
    (event: WheelEvent<HTMLDivElement>) => {
      const element = scrollRef.current;
      if (!element) return;
      if (Math.abs(event.deltaY) < Math.abs(event.deltaX)) return;
      if (element.scrollWidth <= element.clientWidth) return;

      const maxScrollLeft = element.scrollWidth - element.clientWidth;
      const isAtStart = element.scrollLeft <= 0;
      const isAtEnd = element.scrollLeft >= maxScrollLeft;
      const isScrollingToStart = event.deltaY < 0;
      const isScrollingToEnd = event.deltaY > 0;
      if ((isAtStart && isScrollingToStart) || (isAtEnd && isScrollingToEnd)) {
        return;
      }

      event.preventDefault();
      scrollByOffset(event.deltaY);
    },
    [scrollByOffset],
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (!enableKeyboardScroll) return;

      if (event.key === "ArrowRight") {
        event.preventDefault();
        scrollByOffset(keyboardScrollStep);
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        scrollByOffset(-keyboardScrollStep);
      }
    },
    [enableKeyboardScroll, keyboardScrollStep, scrollByOffset],
  );

  return (
    <div
      ref={scrollRef}
      role="region"
      aria-label={scrollAreaLabel}
      tabIndex={enableKeyboardScroll ? 0 : -1}
      onWheel={handleWheel}
      onKeyDown={handleKeyDown}
      className={cn(
        "scrollbar-hide touch-pan-x overflow-x-auto overflow-y-hidden overscroll-x-contain",
        "focus-visible:ring-2 focus-visible:ring-[#391616]/30 focus-visible:outline-none",
        className,
      )}
    >
      <div className="flex w-max gap-3 pb-1">
        {imageUrls.map((imageUrl, index) => (
          <div
            key={`${imageUrl}-${index}`}
            className="relative shrink-0 overflow-hidden rounded-2xl bg-[#d9d9d9]"
            style={tileStyle}
          >
            {/* 로컬 Blob URL 미리보기는 next/image 최적화 대상이 아니어서 img를 사용한다. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={`${imageAltPrefix} ${index + 1}`}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
