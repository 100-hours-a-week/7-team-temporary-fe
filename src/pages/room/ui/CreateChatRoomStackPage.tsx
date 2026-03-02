"use client";

import { useEffect } from "react";

import { useStackPage } from "@/widgets/stack";

export function CreateChatRoomStackPage() {
  const { setHeaderContent, setHeaderRightContent } = useStackPage();

  useEffect(() => {
    setHeaderContent(<span className="text-[18px] font-semibold text-black">채팅방 생성</span>);
    setHeaderRightContent(null);
    return () => {
      setHeaderContent(null);
      setHeaderRightContent(null);
    };
  }, [setHeaderContent, setHeaderRightContent]);

  return <div className="px-6 pt-4" />;
}
