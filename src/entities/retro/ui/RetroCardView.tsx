"use client";

import type { ReactNode } from "react";

import { MoreButton } from "@/shared/ui/button";
import { HorizontalImageAlbum } from "@/shared/ui/image";
import { Icon } from "@/shared/ui/icon";

import { RetroContentText } from "./RetroContentText";

interface RetroCardViewProps {
  dateLabel: string;
  timeLabel: string;
  imageUrls: string[];
  content: string;
  visibilityText: string;
  isLiked: boolean;
  likeCount: number;
  onLikeClick: () => void;
  onMoreClick: () => void;
  onShareClick?: () => void;
  actionSheet?: ReactNode;
}

export function RetroCardView({
  dateLabel,
  timeLabel,
  imageUrls,
  content,
  visibilityText,
  isLiked,
  likeCount,
  onLikeClick,
  onMoreClick,
  onShareClick,
  actionSheet,
}: RetroCardViewProps) {
  return (
    <article className="pt-3 pb-3">
      <header className="flex items-center justify-between">
        <h3 className="text-[16px] font-semibold text-black">{dateLabel} 회고</h3>
        <span className="text-[14px] font-medium text-[#9a9a9a]">{timeLabel}</span>
      </header>

      {imageUrls.length > 0 ? (
        <div className="scrollbar-hide mt-3 w-full overflow-x-auto pb-1">
          <HorizontalImageAlbum
            imageUrls={imageUrls}
            tileSize={140}
            imageAltPrefix={`${dateLabel} 회고 이미지`}
          />
        </div>
      ) : null}

      <RetroContentText
        value={content}
        className="mt-3"
      />

      <footer className="mt-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            type="button"
            aria-label={isLiked ? "좋아요 취소" : "좋아요"}
            aria-pressed={isLiked}
            onClick={onLikeClick}
            className="flex items-center gap-1"
          >
            <Icon
              name={isLiked ? "liked" : "unliked"}
              className={`h-7 w-7 ${isLiked ? "text-[#541e0f]" : "text-black"}`}
              aria-hidden
            />
            <span
              className={`text-[14px] font-semibold ${isLiked ? "text-[#541e0f]" : "text-black"}`}
            >
              {likeCount}
            </span>
          </button>
          <span className="text-[14px] font-semibold text-black">{visibilityText}</span>
        </div>

        <div className="flex items-center gap-3">
          <MoreButton onClick={onMoreClick} />
          <button
            type="button"
            aria-label="공유"
            onClick={onShareClick}
            className="flex h-10 w-10 items-center justify-center"
          >
            <Icon
              name="share"
              className="h-7 w-7"
              aria-hidden
            />
          </button>
        </div>
      </footer>

      {actionSheet}
    </article>
  );
}
