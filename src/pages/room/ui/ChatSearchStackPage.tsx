"use client";

import { useEffect } from "react";

import { useStackPage } from "@/widgets/stack";

export function ChatSearchStackPage() {
  const { setHeaderContent } = useStackPage();

  useEffect(() => {
    setHeaderContent(<span className="text-[18px] font-semibold text-black">채팅방 찾기</span>);
    return () => setHeaderContent(null);
  }, [setHeaderContent]);

  return <div className="px-6 pt-4" />;
}
