"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

import type { AppTab } from "./types";

interface TabContextValue {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
}

const TabContext = createContext<TabContextValue | null>(null);

interface TabProviderProps {
  initialTab?: AppTab;
  children: ReactNode;
}

export function TabProvider({ initialTab = "home", children }: TabProviderProps) {
  const [activeTab, setActiveTab] = useState<AppTab>(initialTab);

  const value = useMemo(
    () => ({
      activeTab,
      setActiveTab,
    }),
    [activeTab],
  );

  return <TabContext.Provider value={value}>{children}</TabContext.Provider>;
}

export function useTab() {
  const ctx = useContext(TabContext);
  if (!ctx) {
    throw new Error("useTab must be used within TabProvider");
  }
  return ctx;
}
