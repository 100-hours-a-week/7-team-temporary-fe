"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { createUuid } from "@/shared/lib";

import { STACK_PAGE_EXIT_MS } from "./constants";
import type { StackEntry, StackPageContextValue } from "./stackPageContext";

const createStackKey = () => createUuid();

export function useStackPageState(): StackPageContextValue {
  const [stack, setStack] = useState<StackEntry[]>([]);
  const [poppingKey, setPoppingKey] = useState<string | null>(null);
  const [baseHeaderContent, setBaseHeaderContent] = useState<ReactNode | null>(null);
  const [baseHeaderRightContent, setBaseHeaderRightContent] = useState<ReactNode | null>(null);

  const push = useCallback((element: StackEntry["element"]) => {
    setStack((prev) => {
      const next = [
        ...prev,
        { key: createStackKey(), element, headerContent: null, headerRightContent: null },
      ];
      window.history.pushState({ stackDepth: next.length }, "");
      return next;
    });
  }, []);

  const replace = useCallback((element: StackEntry["element"]) => {
    setStack((prev) => {
      if (prev.length === 0) {
        const next = [
          { key: createStackKey(), element, headerContent: null, headerRightContent: null },
        ];
        window.history.pushState({ stackDepth: next.length }, "");
        return next;
      }
      return [
        ...prev.slice(0, -1),
        { key: createStackKey(), element, headerContent: null, headerRightContent: null },
      ];
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

  const setHeaderContent = useCallback((content: ReactNode | null, entryKey: string | null) => {
    if (!entryKey) {
      setBaseHeaderContent((prev) => (prev === content ? prev : content));
      return;
    }

    setStack((prev) =>
      prev.map((entry) => {
        if (entry.key !== entryKey) return entry;
        if (entry.headerContent === content) return entry;
        return { ...entry, headerContent: content };
      }),
    );
  }, []);

  const setHeaderRightContent = useCallback(
    (content: ReactNode | null, entryKey: string | null) => {
      if (!entryKey) {
        setBaseHeaderRightContent((prev) => (prev === content ? prev : content));
        return;
      }

      setStack((prev) =>
        prev.map((entry) => {
          if (entry.key !== entryKey) return entry;
          if (entry.headerRightContent === content) return entry;
          return { ...entry, headerRightContent: content };
        }),
      );
    },
    [],
  );

  const headerContent =
    stack.length > 0 ? (stack[stack.length - 1]?.headerContent ?? null) : baseHeaderContent;
  const headerRightContent =
    stack.length > 0
      ? (stack[stack.length - 1]?.headerRightContent ?? null)
      : baseHeaderRightContent;

  return useMemo(
    () => ({
      push,
      pop,
      replace,
      depth: stack.length,
      stack,
      poppingKey,
      headerContent,
      headerRightContent,
      setHeaderContent,
      setHeaderRightContent,
    }),
    [
      push,
      pop,
      replace,
      stack,
      poppingKey,
      headerContent,
      headerRightContent,
      setHeaderContent,
      setHeaderRightContent,
    ],
  );
}
