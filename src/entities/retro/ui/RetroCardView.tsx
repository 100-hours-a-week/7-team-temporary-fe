"use client";

import { useState, type ReactNode } from "react";
import type { MyRetroCardVM, PublicRetroCardVM } from "../model";

import { MoreButton } from "@/shared/ui/button";
import { HorizontalImageAlbum, ImageDialog } from "@/shared/ui/image";
import { Icon } from "@/shared/ui/icon";
import { RetroVisibilityToggle } from "@/shared/ui/retro";

import { RetroContentText } from "./RetroContentText";

interface RetroCardViewProps {
  vm: MyRetroCardVM | PublicRetroCardVM;
  isLiked: boolean;
  likeCount: number;
  onLikeClick: () => void;
  onMoreClick: () => void;
  actionSheet?: ReactNode;
  onVisibilityToggle?: (checked: boolean) => void;
  isOpenChecked?: boolean;
}

export function RetroCardView({
  vm,
  isLiked,
  likeCount,
  onLikeClick,
  onMoreClick,
  actionSheet,
  onVisibilityToggle,
  isOpenChecked,
}: RetroCardViewProps) {
  const authorNickname = "authorNickname" in vm ? vm.authorNickname : undefined;
  const visibilityText = "visibilityText" in vm ? vm.visibilityText : undefined;
  const [selectedImage, setSelectedImage] = useState<{ url: string; alt: string } | null>(null);

  return (
    <article className="pb-3">
      <header className="flex items-center justify-between">
        {authorNickname ? (
          <>
            <div className="flex items-center gap-2">
              <span className="text-[16px] font-semibold text-black">{authorNickname}</span>
              <span className="text-[14px] font-medium text-[#9a9a9a]">{vm.dateLabel}</span>
            </div>
            <span className="text-[14px] font-medium text-[#9a9a9a]">{vm.timeLabel}</span>
          </>
        ) : (
          <>
            <h3 className="text-[16px] font-semibold text-black">{vm.dateLabel} 회고</h3>
            <span className="text-[14px] font-medium text-[#9a9a9a]">{vm.timeLabel}</span>
          </>
        )}
      </header>

      {vm.imageUrls.length > 0 ? (
        <HorizontalImageAlbum
          imageUrls={vm.imageUrls}
          tileSize={140}
          imageAltPrefix={`${vm.dateLabel} 회고 이미지`}
          scrollAreaLabel={`${vm.dateLabel} 회고 이미지 가로 스크롤`}
          className="mt-3 w-full"
          onImageClick={(url, alt) => setSelectedImage({ url, alt })}
        />
      ) : null}

      <ImageDialog
        open={selectedImage !== null}
        imageUrl={selectedImage?.url ?? null}
        alt={selectedImage?.alt ?? ""}
        onOpenChange={(open) => {
          if (!open) setSelectedImage(null);
        }}
      />

      <RetroContentText
        value={vm.content}
        className="mt-3"
        expandable
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
          {onVisibilityToggle !== undefined && isOpenChecked !== undefined ? (
            <RetroVisibilityToggle
              checked={isOpenChecked}
              onCheckedChange={onVisibilityToggle}
            />
          ) : visibilityText ? (
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
