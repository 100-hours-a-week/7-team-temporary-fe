"use client";

import { cn } from "@/shared/lib";

interface HorizontalImageAlbumProps {
  imageUrls: string[];
  tileSize?: number;
  imageAltPrefix?: string;
  className?: string;
}

export function HorizontalImageAlbum({
  imageUrls,
  tileSize = 160,
  imageAltPrefix = "이미지 미리보기",
  className,
}: HorizontalImageAlbumProps) {
  const tileStyle = { width: `${tileSize}px`, height: `${tileSize}px` };

  return (
    <div className={cn("flex gap-3", className)}>
      {imageUrls.map((imageUrl, index) => (
        <div
          key={`${imageUrl}-${index}`}
          className="relative shrink-0 overflow-hidden rounded-2xl bg-[#d9d9d9]"
          style={tileStyle}
        >
          {/* 로컬 Blob URL 미리보기는 next/image 최적화 대상이 아니어서 img를 사용한다. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={`${imageAltPrefix} ${index + 1}`}
            className="h-full w-full object-cover"
          />
        </div>
      ))}
    </div>
  );
}
