"use client";

import type { ReactNode } from "react";
import { createContext, useContext } from "react";

export interface StackEntry {
  key: string;
  element: ReactNode;
}

export interface StackPageContextValue {
  push: (element: ReactNode) => void;
  pop: () => void;
  depth: number;
  stack: StackEntry[];
  poppingKey: string | null;
  headerContent: ReactNode | null;
  setHeaderContent: (content: ReactNode | null) => void;
}

export const StackPageContext = createContext<StackPageContextValue | null>(null);

export function useStackPage() {
  const ctx = useContext(StackPageContext);
  if (!ctx) {
    throw new Error("useStackPage must be used within StackPageRoot");
  }
  return ctx;
}
