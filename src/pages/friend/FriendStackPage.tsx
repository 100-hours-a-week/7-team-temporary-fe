"use client";

import { useEffect } from "react";

import { FriendList } from "@/widgets/friend-list";
import { useStackPage } from "@/widgets/stack";

export function FriendStackPage() {
  const { setHeaderContent } = useStackPage();

  useEffect(() => {
    setHeaderContent(<span className="text-xl font-semibold text-black">친구</span>);
    return () => setHeaderContent(null);
  }, [setHeaderContent]);

  return <FriendList />;
}
