"use client";

import type { ReactNode } from "react";
import { createContext, useCallback, useContext, useMemo } from "react";

export interface StackEntry {
  key: string;
  element: ReactNode;
  headerContent?: ReactNode | null;
}

export interface StackPageContextValue {
  push: (element: ReactNode) => void;
  pop: () => void;
  depth: number;
  stack: StackEntry[];
  poppingKey: string | null;
  headerContent: ReactNode | null;
  setHeaderContent: (content: ReactNode | null, entryKey: string | null) => void;
}

export const StackPageContext = createContext<StackPageContextValue | null>(null);
export const StackPageEntryContext = createContext<{ entryKey: string | null } | null>(null);

export function useStackPage() {
  const ctx = useContext(StackPageContext);
  const entry = useContext(StackPageEntryContext);

  if (!ctx) {
    throw new Error("useStackPage must be used within StackPageRoot");
  }

  const entryKey = entry?.entryKey ?? null;
  const scopedSetHeaderContent = useCallback(
    (content: ReactNode | null) => ctx.setHeaderContent(content, entryKey),
    [ctx.setHeaderContent, entryKey],
  );

  return useMemo(
    () => ({
      ...ctx,
      setHeaderContent: scopedSetHeaderContent,
    }),
    [ctx, scopedSetHeaderContent],
  );
}
