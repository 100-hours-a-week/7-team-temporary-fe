"use client";

import type { ReactNode } from "react";
import type { MyRetroCardVM, PublicRetroCardVM } from "../model";

import { MoreButton } from "@/shared/ui/button";
import { HorizontalImageAlbum } from "@/shared/ui/image";
import { Icon } from "@/shared/ui/icon";

import { RetroContentText } from "./RetroContentText";

interface RetroCardViewProps {
  vm: MyRetroCardVM | PublicRetroCardVM;
  isLiked: boolean;
  likeCount: number;
  onLikeClick: () => void;
  onMoreClick: () => void;
  actionSheet?: ReactNode;
}

export function RetroCardView({
  vm,
  isLiked,
  likeCount,
  onLikeClick,
  onMoreClick,
  actionSheet,
}: RetroCardViewProps) {
  const authorNickname = "authorNickname" in vm ? vm.authorNickname : undefined;
  const visibilityText = "visibilityText" in vm ? vm.visibilityText : undefined;

  return (
    <article className="pt-3 pb-3">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-[16px] font-semibold text-black">{vm.dateLabel} 회고</h3>
          {authorNickname ? (
            <span className="text-[16px] font-semibold text-black">{authorNickname}</span>
          ) : null}
        </div>
        <span className="text-[14px] font-medium text-[#9a9a9a]">{vm.timeLabel}</span>
      </header>

      {vm.imageUrls.length > 0 ? (
        <div className="scrollbar-hide mt-3 w-full overflow-x-auto pb-1">
          <HorizontalImageAlbum
            imageUrls={vm.imageUrls}
            tileSize={140}
            imageAltPrefix={`${vm.dateLabel} 회고 이미지`}
          />
        </div>
      ) : null}

      <RetroContentText
        value={vm.content}
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
          {visibilityText ? (
            <span className="text-[14px] font-semibold text-black">{visibilityText}</span>
          ) : null}
        </div>

        <div className="flex items-center">
          <MoreButton onClick={onMoreClick} />
        </div>
      </footer>

      {actionSheet}
    </article>
  );
}
