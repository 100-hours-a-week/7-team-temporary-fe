"use client";

import { useEffect } from "react";

import { useStackPage } from "@/widgets/stack";

export function TaskBasketStackPage() {
  const { setHeaderContent } = useStackPage();

  useEffect(() => {
    setHeaderContent(<span className="text-xl font-semibold text-black">작업 바구니</span>);
    return () => setHeaderContent(null);
  }, [setHeaderContent]);

  return (
    <div className="px-6 py-8">
      <p className="text-base text-neutral-500">작업 바구니 화면을 준비 중이에요.</p>
    </div>
  );
}
