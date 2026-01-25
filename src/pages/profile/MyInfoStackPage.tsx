"use client";

"use client";

import { useEffect } from "react";

import { useStackPage } from "@/widgets/stack";

export function MyInfoStackPage() {
  const { setHeaderContent } = useStackPage();

  useEffect(() => {
    setHeaderContent(<span className="text-xl font-semibold text-black">내 정보</span>);
    return () => setHeaderContent(null);
  }, [setHeaderContent]);

  return (
    <div className="flex min-h-full flex-col px-6 py-10">
      <div className="flex flex-1 flex-col items-center justify-center gap-3">
        <div className="text-lg font-semibold text-neutral-900">내 정보</div>
        <p className="text-sm text-neutral-500">스택 페이지 목업입니다.</p>
      </div>
    </div>
  );
}
