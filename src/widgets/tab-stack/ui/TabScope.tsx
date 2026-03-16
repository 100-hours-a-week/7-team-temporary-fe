"use client";

import { useEffect, useRef, type ReactNode } from "react";

import { cn } from "@/shared/lib";

import { useTab } from "../model/tabContext";
import type { AppTab } from "../model/types";

interface TabScopeProps {
  tab: AppTab;
  children: ReactNode;
  className?: string;
  keepMounted?: boolean;
}

export function TabScope({ tab, children, className, keepMounted = false }: TabScopeProps) {
  const { activeTab } = useTab();
  const isActive = activeTab === tab;
  const hasBeenActiveRef = useRef(isActive);

  useEffect(() => {
    if (isActive) hasBeenActiveRef.current = true;
  }, [isActive]);

  if (!isActive && !keepMounted && !hasBeenActiveRef.current) {
    return null;
  }

  return (
    <div
      className={cn("w-full", isActive ? "block" : "hidden", className)}
      data-tab={tab}
    >
      {children}
    </div>
  );
}
