import type { MutableRefObject, RefObject } from "react";

type PlannerEditScrollParams = {
  pageRef: RefObject<HTMLDivElement | null>;
  scrollParentRef: MutableRefObject<HTMLElement | null>;
  lastScrollTopRef: MutableRefObject<number>;
};

export function capturePlannerEditScrollPosition({
  pageRef,
  scrollParentRef,
  lastScrollTopRef,
}: PlannerEditScrollParams) {
  if (!scrollParentRef.current) {
    scrollParentRef.current = getScrollParent(pageRef.current);
  }
  const element = scrollParentRef.current;
  if (!element) return;
  lastScrollTopRef.current = element.scrollTop;
}

export function restorePlannerEditScrollPosition({
  pageRef,
  scrollParentRef,
  lastScrollTopRef,
}: PlannerEditScrollParams) {
  if (!scrollParentRef.current) {
    scrollParentRef.current = getScrollParent(pageRef.current);
  }
  const element = scrollParentRef.current;
  if (!element) return;
  const scrollTop = lastScrollTopRef.current;
  requestAnimationFrame(() => {
    element.scrollTop = scrollTop;
  });
}

function getScrollParent(element: HTMLElement | null) {
  if (!element || typeof window === "undefined") return null;
  let current: HTMLElement | null = element.parentElement;
  while (current) {
    const styles = window.getComputedStyle(current);
    if (
      styles.overflowY === "auto" ||
      styles.overflowY === "scroll" ||
      styles.overflow === "auto" ||
      styles.overflow === "scroll"
    ) {
      return current;
    }
    current = current.parentElement;
  }
  return null;
}
