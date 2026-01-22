"use client";

import type { ReactNode } from "react";

import { StackPageContext } from "../model/stackPageContext";
import { useStackPageState } from "../model/useStackPageState";

interface StackPageRootProps {
  children: ReactNode;
}

export function StackPageRoot({ children }: StackPageRootProps) {
  const contextValue = useStackPageState();

  return <StackPageContext.Provider value={contextValue}>{children}</StackPageContext.Provider>;
}
