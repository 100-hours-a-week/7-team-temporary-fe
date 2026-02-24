"use client";

import { useCallback, useState } from "react";

export function useExcludedTasksSheetState(defaultOpen = true) {
  const [isExcludedSheetOpen, setIsExcludedSheetOpen] = useState(defaultOpen);
  const [isExcludedSheetExpanded, setIsExcludedSheetExpanded] = useState(false);

  const openExcludedTasksSheet = useCallback(() => {
    setIsExcludedSheetOpen(true);
    setIsExcludedSheetExpanded(false);
  }, []);

  return {
    isExcludedSheetOpen,
    setIsExcludedSheetOpen,
    isExcludedSheetExpanded,
    setIsExcludedSheetExpanded,
    openExcludedTasksSheet,
  };
}
