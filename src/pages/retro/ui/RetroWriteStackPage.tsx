"use client";

import { useEffect, useMemo } from "react";

import { RetroWriteForm } from "@/features/retro";
import { formatYmdDate, parseDateInput } from "@/shared/lib";
import { useStackPage } from "@/widgets/stack";

interface RetroWriteStackPageProps {
  baseDate?: string | null;
}

export function RetroWriteStackPage({ baseDate }: RetroWriteStackPageProps) {
  const { setHeaderContent } = useStackPage();

  const dateLabel = useMemo(() => {
    const parsedDate = parseDateInput(baseDate);
    return formatYmdDate(parsedDate, ".");
  }, [baseDate]);

  useEffect(() => {
    setHeaderContent(<span className="text-[18px] font-semibold text-black">회고 작성</span>);
    return () => setHeaderContent(null);
  }, [setHeaderContent]);

  return <RetroWriteForm dateLabel={dateLabel} />;
}
