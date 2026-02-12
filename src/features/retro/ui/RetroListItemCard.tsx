"use client";

import { useEffect, useState } from "react";

import { RetroCardView, type MyRetroCardVM, type PublicRetroCardVM } from "@/entities/retro";
import { MoreActionSheet } from "@/shared/ui/bottom-sheet";

type RetroListItemCardProps = {
  vm: MyRetroCardVM | PublicRetroCardVM;
  onLikeClick?: (isLiked?: boolean) => void;
  onMoreClick?: () => void;
  onEditClick?: () => void;
  onDeleteClick?: () => void;
  onShareClick?: () => void;
};

export function RetroListItemCard({
  vm,
  onLikeClick,
  onMoreClick,
  onEditClick,
  onDeleteClick,
  onShareClick,
}: RetroListItemCardProps) {
  const isMine = vm.isMine;
  const [isLiked, setIsLiked] = useState(vm.defaultLiked ?? false);
  const [displayLikeCount, setDisplayLikeCount] = useState(vm.likeCount);
  const [isActionSheetOpen, setIsActionSheetOpen] = useState(false);

  useEffect(() => {
    setDisplayLikeCount(vm.likeCount);
  }, [vm.likeCount]);

  useEffect(() => {
    setIsLiked(vm.defaultLiked ?? false);
  }, [vm.defaultLiked]);

  const handleLikeClick = () => {
    setIsLiked((prev) => {
      const nextLiked = !prev;
      setDisplayLikeCount((count) => Math.max(0, count + (nextLiked ? 1 : -1)));
      onLikeClick?.(nextLiked);
      return nextLiked;
    });
  };

  const handleMoreClick = () => {
    setIsActionSheetOpen(true);
    onMoreClick?.();
  };

  const handleEditClick = () => {
    setIsActionSheetOpen(false);
    onEditClick?.();
  };

  const handleDeleteClick = () => {
    setIsActionSheetOpen(false);
    onDeleteClick?.();
  };

  const handleShareClick = () => {
    setIsActionSheetOpen(false);
    onShareClick?.();
  };

  return (
    <RetroCardView
      vm={vm}
      isLiked={isLiked}
      likeCount={displayLikeCount}
      onLikeClick={handleLikeClick}
      onMoreClick={handleMoreClick}
      actionSheet={
        isActionSheetOpen ? (
          <MoreActionSheet
            open={isActionSheetOpen}
            onOpenChange={setIsActionSheetOpen}
          >
            <button
              type="button"
              onClick={handleShareClick}
              className="h-12 w-full rounded-xl border border-[#d9d9d9] bg-white text-[16px] font-semibold text-black"
            >
              공유하기
            </button>
            {isMine ? (
              <>
                <button
                  type="button"
                  onClick={handleEditClick}
                  className="h-12 w-full rounded-xl border border-[#d9d9d9] bg-white text-[16px] font-semibold text-black"
                >
                  수정
                </button>
                <button
                  type="button"
                  onClick={handleDeleteClick}
                  className="h-12 w-full rounded-xl bg-[#541e0f] text-[16px] font-semibold text-white"
                >
                  삭제
                </button>
              </>
            ) : null}
          </MoreActionSheet>
        ) : null
      }
    />
  );
}
