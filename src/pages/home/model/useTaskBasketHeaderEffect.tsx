"use client";

import { useEffect, type ReactNode } from "react";

import { TASK_BASKET_PAGE_HEADER_TITLE } from "@/widgets/task-basket";

interface UseTaskBasketHeaderEffectParams {
  setHeaderContent: (content: ReactNode | null) => void;
}

export function useTaskBasketHeaderEffect({ setHeaderContent }: UseTaskBasketHeaderEffectParams) {
  useEffect(() => {
    setHeaderContent(
      <span className="text-xl font-semibold text-black">{TASK_BASKET_PAGE_HEADER_TITLE}</span>,
    );
    return () => setHeaderContent(null);
  }, [setHeaderContent]);
}
