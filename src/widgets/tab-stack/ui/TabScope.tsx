"use client";

import type { ReactNode } from "react";

import { cn } from "@/shared/lib";

import { useTab } from "../model/tabContext";
import type { AppTab } from "../model/types";

interface TabScopeProps {
  tab: AppTab;
  children: ReactNode;
  className?: string;
}

export function TabScope({ tab, children, className }: TabScopeProps) {
  const { activeTab } = useTab();
  const isActive = activeTab === tab;

  return (
    <div
      className={cn(isActive ? "block" : "hidden", className)}
      data-tab={tab}
    >
      {children}
    </div>
  );
}
