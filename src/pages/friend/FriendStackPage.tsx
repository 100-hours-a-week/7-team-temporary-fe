"use client";

import { useCallback, useEffect, useState } from "react";

import { FriendAddSheet } from "@/features/friend";
import { FriendList } from "@/widgets/friend-list";
import { useStackPage } from "@/widgets/stack";

export function FriendStackPage() {
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const { setHeaderContent, setHeaderRightContent } = useStackPage();
  const handleOpenAddSheet = useCallback(() => setIsAddSheetOpen(true), []);

  useEffect(() => {
    setHeaderContent(<span className="text-xl font-semibold text-black">친구</span>);
    setHeaderRightContent(
      <button
        type="button"
        onClick={handleOpenAddSheet}
        className="text-[18px] font-semibold text-black"
      >
        친구 추가
      </button>,
    );
    return () => {
      setHeaderContent(null);
      setHeaderRightContent(null);
    };
  }, [handleOpenAddSheet, setHeaderContent, setHeaderRightContent]);

  return (
    <>
      <FriendList />
      <FriendAddSheet
        open={isAddSheetOpen}
        onOpenChange={setIsAddSheetOpen}
      />
    </>
  );
}
