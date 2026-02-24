"use client";

import { useEffect } from "react";

import { useStackPage } from "@/widgets/stack";

interface ChatRoomStackPageProps {
  roomId: number;
}

export function ChatRoomStackPage({ roomId: _roomId }: ChatRoomStackPageProps) {
  const { setHeaderContent } = useStackPage();

  useEffect(() => {
    setHeaderContent(<span className="text-[18px] font-semibold text-black">채팅방</span>);
    return () => setHeaderContent(null);
  }, [setHeaderContent]);

  return <div className="px-6 pt-4" />;
}
