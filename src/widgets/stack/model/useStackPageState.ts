"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { STACK_PAGE_EXIT_MS } from "./constants";
import type { StackEntry, StackPageContextValue } from "./stackPageContext";

const createStackKey = () => crypto.randomUUID();

export function useStackPageState(): StackPageContextValue {
  const [stack, setStack] = useState<StackEntry[]>([]);
  const [poppingKey, setPoppingKey] = useState<string | null>(null);
  const [headerContent, setHeaderContent] = useState<ReactNode | null>(null);

  const push = useCallback((element: StackEntry["element"]) => {
    setStack((prev) => {
      const next = [...prev, { key: createStackKey(), element }];
      window.history.pushState({ stackDepth: next.length }, "");
      return next;
    });
  }, []);

  const pop = useCallback(() => {
    if (stack.length === 0 || poppingKey) return;
    const currentTopKey = stack[stack.length - 1]?.key;
    if (!currentTopKey) return;

    setPoppingKey(currentTopKey);
  }, [poppingKey, stack]);

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const depth = typeof event.state?.stackDepth === "number" ? event.state.stackDepth : 0;

      setStack((prev) => prev.slice(0, depth));
      setPoppingKey(null);
    };

    window.history.replaceState({ stackDepth: 0 }, "");
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  useEffect(() => {
    if (!poppingKey) return;

    const timer = window.setTimeout(() => {
      setStack((prev) => prev.slice(0, -1));
      setPoppingKey(null);
      window.history.back();
    }, STACK_PAGE_EXIT_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, [poppingKey]);

  return useMemo(
    () => ({
      push,
      pop,
      depth: stack.length,
      stack,
      poppingKey,
      headerContent,
      setHeaderContent,
    }),
    [push, pop, stack, poppingKey, headerContent],
  );
}
