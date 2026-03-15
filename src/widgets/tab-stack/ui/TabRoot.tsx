"use client";

import type { ReactNode } from "react";

import { TabProvider } from "../model/tabContext";

interface TabRootProps {
  children: ReactNode;
}

export function TabRoot({ children }: TabRootProps) {
  return <TabProvider>{children}</TabProvider>;
}
