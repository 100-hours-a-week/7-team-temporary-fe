"use client";

import { useEffect } from "react";

import { useStackPage } from "@/widgets/stack";

interface GroupChatMembersStackPageProps {
  roomId: number;
}

export function GroupChatMembersStackPage({ roomId: _roomId }: GroupChatMembersStackPageProps) {
  const { setHeaderContent, setHeaderRightContent } = useStackPage();

  useEffect(() => {
    setHeaderContent(<span className="text-[18px] font-semibold text-black">그룹원 목록</span>);
    setHeaderRightContent(null);
    return () => {
      setHeaderContent(null);
      setHeaderRightContent(null);
    };
  }, [setHeaderContent, setHeaderRightContent]);

  return <div className="px-6 pt-4" />;
}
