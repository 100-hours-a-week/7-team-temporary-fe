"use client";

import { useEffect, useState } from "react";

import {
  RetroCardView,
  type MyRetroCardVM,
  type PublicRetroCardVM,
  useRetroLikeMutation,
} from "@/entities/retro";
import { MoreActionSheet } from "@/shared/ui/bottom-sheet";
import { useToast } from "@/shared/ui/toast";

type RetroListItemCardProps = {
  vm: MyRetroCardVM | PublicRetroCardVM;
  onLikeClick?: (isLiked: boolean) => Promise<void> | void;
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
  const { showToast } = useToast();
  const likeMutation = useRetroLikeMutation();
  const [isLiked, setIsLiked] = useState(vm.defaultLiked ?? false);
  const [displayLikeCount, setDisplayLikeCount] = useState(vm.likeCount);
  const [isActionSheetOpen, setIsActionSheetOpen] = useState(false);

  useEffect(() => {
    setDisplayLikeCount(vm.likeCount);
  }, [vm.likeCount]);

  useEffect(() => {
    setIsLiked(vm.defaultLiked ?? false);
  }, [vm.defaultLiked]);

  const handleLikeClick = async () => {
    if (likeMutation.isPending) return;

    const prevLiked = isLiked;
    const prevLikeCount = displayLikeCount;
    const nextLiked = !prevLiked;

    setIsLiked(nextLiked);
    setDisplayLikeCount((count) => Math.max(0, count + (nextLiked ? 1 : -1)));

    try {
      await likeMutation.mutateAsync({ reflectionId: vm.id, nextLiked });
      await Promise.resolve(onLikeClick?.(nextLiked));
    } catch {
      setIsLiked(prevLiked);
      setDisplayLikeCount(prevLikeCount);
      showToast("좋아요 처리에 실패했습니다.", "error");
    }
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
      onLikeClick={() => void handleLikeClick()}
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
