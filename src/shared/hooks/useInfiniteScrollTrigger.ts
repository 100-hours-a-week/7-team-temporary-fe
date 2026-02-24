"use client";

import { useEffect, useRef } from "react";
import type { RefObject } from "react";

interface UseInfiniteScrollTriggerOptions {
  enabled?: boolean;
  hasMore: boolean;
  isFetching: boolean;
  onLoadMore: () => void;
  rootRef?: RefObject<HTMLElement | null>;
  rootMargin?: string;
  threshold?: number | number[];
}

function getScrollParent(element: HTMLElement | null) {
  if (!element || typeof window === "undefined") return null;

  const classRoot = element.closest(
    ".overflow-y-auto, .overflow-auto, .overflow-y-scroll",
  ) as HTMLElement | null;
  if (classRoot) return classRoot;

  let current: HTMLElement | null = element.parentElement;
  while (current) {
    const styles = window.getComputedStyle(current);
    const overflowY = styles.overflowY;
    const overflow = styles.overflow;
    if (
      overflowY === "auto" ||
      overflowY === "scroll" ||
      overflow === "auto" ||
      overflow === "scroll"
    ) {
      return current;
    }
    current = current.parentElement;
  }

  return null;
}

export function useInfiniteScrollTrigger<TElement extends HTMLElement = HTMLDivElement>({
  enabled = true,
  hasMore,
  isFetching,
  onLoadMore,
  rootRef,
  rootMargin = "200px",
  threshold,
}: UseInfiniteScrollTriggerOptions) {
  const loadMoreRef = useRef<TElement | null>(null);
  const onLoadMoreRef = useRef(onLoadMore);

  useEffect(() => {
    onLoadMoreRef.current = onLoadMore;
  }, [onLoadMore]);

  useEffect(() => {
    if (!enabled) return;
    if (!loadMoreRef.current) return;
    if (!hasMore) return;
    if (isFetching) return;

    const root = rootRef?.current ?? getScrollParent(loadMoreRef.current);
    const observer = new IntersectionObserver(
      (entries) => {
        const isIntersecting = entries.some((entry) => entry.isIntersecting);
        if (!isIntersecting) return;
        onLoadMoreRef.current();
      },
      { root, rootMargin, threshold },
    );

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [enabled, hasMore, isFetching, rootMargin, rootRef, threshold]);

  return { loadMoreRef };
}
