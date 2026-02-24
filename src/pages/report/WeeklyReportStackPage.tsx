"use client";

import { useEffect } from "react";

import { useStackPage } from "@/widgets/stack";

export function WeeklyReportStackPage() {
  const { setHeaderContent } = useStackPage();

  useEffect(() => {
    setHeaderContent(<span className="text-xl font-semibold text-black">주간 플래너 리포트</span>);
    return () => setHeaderContent(null);
  }, [setHeaderContent]);

  return (
    <div className="px-6 pt-4 pb-32">
      <div className="rounded-2xl px-4 py-6 text-center text-sm text-neutral-500">
        주간 리포트 화면을 준비 중입니다.
      </div>
    </div>
  );
}
