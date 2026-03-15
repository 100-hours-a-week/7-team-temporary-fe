"use client";

import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";

import type { AppTab } from "./types";

interface TabContextValue {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
}

const TabContext = createContext<TabContextValue | null>(null);

function pathnameToTab(pathname: string): AppTab {
  if (pathname.startsWith("/retro")) return "retro";
  if (pathname.startsWith("/room")) return "room";
  if (pathname.startsWith("/profile")) return "profile";
  return "home";
}

interface TabProviderProps {
  children: ReactNode;
}

export function TabProvider({ children }: TabProviderProps) {
  const pathname = usePathname();
  const router = useRouter();

  const activeTab = pathnameToTab(pathname);

  const setActiveTab = useCallback(
    (tab: AppTab) => {
      router.push(`/${tab}`);
    },
    [router],
  );

  const value = useMemo(() => ({ activeTab, setActiveTab }), [activeTab, setActiveTab]);

  return <TabContext.Provider value={value}>{children}</TabContext.Provider>;
}

export function useTab() {
  const ctx = useContext(TabContext);
  if (!ctx) {
    throw new Error("useTab must be used within TabProvider");
  }
  return ctx;
}
