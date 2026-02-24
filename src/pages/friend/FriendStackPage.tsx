"use client";

import { useCallback, useEffect, useState } from "react";

import { FriendAddSheet } from "@/features/friend";
import { FriendList } from "@/widgets/friend-list";
import { useStackPage } from "@/widgets/stack";

export function FriendStackPage() {
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const { setHeaderContent } = useStackPage();
  const handleOpenAddSheet = useCallback(() => setIsAddSheetOpen(true), []);

  useEffect(() => {
    setHeaderContent(
      <div className="-mr-[30px] flex w-[calc(100%+30px)] items-center justify-between gap-3">
        <span className="text-xl font-semibold text-black">친구</span>
        <button
          type="button"
          onClick={handleOpenAddSheet}
          className="text-[18px] font-semibold text-black"
        >
          친구 추가
        </button>
      </div>,
    );
    return () => setHeaderContent(null);
  }, [handleOpenAddSheet, setHeaderContent]);

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
