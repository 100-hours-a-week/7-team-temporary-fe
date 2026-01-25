"use client";

import type { ReactNode } from "react";

import { TabProvider } from "../model/tabContext";
import type { AppTab } from "../model/types";

interface TabRootProps {
  initialTab?: AppTab;
  children: ReactNode;
}

export function TabRoot({ initialTab, children }: TabRootProps) {
  return <TabProvider initialTab={initialTab}>{children}</TabProvider>;
}
