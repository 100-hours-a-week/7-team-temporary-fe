"use client";

import { useEffect } from "react";

import { EmptyStateCard } from "@/shared/ui/empty";
import { useStackPage } from "@/widgets/stack";

export function FriendStackPage() {
  const { setHeaderContent } = useStackPage();

  useEffect(() => {
    setHeaderContent(<span className="text-xl font-semibold text-black">친구</span>);
    return () => setHeaderContent(null);
  }, [setHeaderContent]);

  return (
    <div className="px-6 pt-[13px] pb-32">
      <EmptyStateCard message="친구 목록 기능" />
    </div>
  );
}
