"use client";

import { useEffect, useState } from "react";

import { RetroCardView, type RetroListItem } from "@/entities/retro";
import { MoreActionSheet } from "@/shared/ui/bottom-sheet";

interface RetroListItemCardProps extends RetroListItem {
  onLikeClick?: (isLiked?: boolean) => void;
  onMoreClick?: () => void;
  onEditClick?: () => void;
  onDeleteClick?: () => void;
  onShareClick?: () => void;
}

export function RetroListItemCard({
  dateLabel,
  timeLabel,
  imageUrls,
  content,
  likeCount,
  defaultLiked = false,
  visibilityText,
  onLikeClick,
  onMoreClick,
  onEditClick,
  onDeleteClick,
  onShareClick,
}: RetroListItemCardProps) {
  const [isLiked, setIsLiked] = useState(defaultLiked);
  const [displayLikeCount, setDisplayLikeCount] = useState(likeCount);
  const [isActionSheetOpen, setIsActionSheetOpen] = useState(false);

  useEffect(() => {
    setDisplayLikeCount(likeCount);
  }, [likeCount]);

  useEffect(() => {
    setIsLiked(defaultLiked);
  }, [defaultLiked]);

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

  return (
    <RetroCardView
      dateLabel={dateLabel}
      timeLabel={timeLabel}
      imageUrls={imageUrls}
      content={content}
      visibilityText={visibilityText}
      isLiked={isLiked}
      likeCount={displayLikeCount}
      onLikeClick={handleLikeClick}
      onMoreClick={handleMoreClick}
      onShareClick={onShareClick}
      actionSheet={
        isActionSheetOpen ? (
          <MoreActionSheet
            open={isActionSheetOpen}
            onOpenChange={setIsActionSheetOpen}
          >
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
          </MoreActionSheet>
        ) : null
      }
    />
  );
}
