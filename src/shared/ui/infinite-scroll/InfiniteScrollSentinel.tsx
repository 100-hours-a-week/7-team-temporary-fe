"use client";

import type { RefObject } from "react";

import { cn } from "@/shared/lib";
import { useInfiniteScrollTrigger } from "@/shared/hooks";

interface InfiniteScrollSentinelProps {
  enabled?: boolean;
  hasMore: boolean;
  isFetching: boolean;
  onLoadMore: () => void;
  rootRef?: RefObject<HTMLElement | null>;
  rootMargin?: string;
  threshold?: number | number[];
  triggerClassName?: string;
  loadingLabel?: string;
  loadingClassName?: string;
}

export function InfiniteScrollSentinel({
  enabled = true,
  hasMore,
  isFetching,
  onLoadMore,
  rootRef,
  rootMargin,
  threshold,
  triggerClassName,
  loadingLabel = "불러오는 중...",
  loadingClassName,
}: InfiniteScrollSentinelProps) {
  const { loadMoreRef } = useInfiniteScrollTrigger<HTMLDivElement>({
    enabled,
    hasMore,
    isFetching,
    onLoadMore,
    rootRef,
    rootMargin,
    threshold,
  });

  if (!enabled) return null;
  if (!hasMore && !isFetching) return null;

  return (
    <>
      <div
        ref={loadMoreRef}
        className={cn("h-px", triggerClassName)}
      />
      {isFetching && hasMore ? (
        <div className={cn("pt-2 text-center text-xs text-neutral-400", loadingClassName)}>
          {loadingLabel}
        </div>
      ) : null}
    </>
  );
}
