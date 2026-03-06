"use client";

import { memo, useEffect, useRef, useState } from "react";

import type { ChatMessageItemVM } from "@/entities/chat-room";

import { CHAT_MESSAGE_BUBBLE_MAX_WIDTH_CLASS, CHAT_MESSAGE_LINE_LIMIT } from "../model/constants";
import { ChatMessageContentDialog } from "./ChatMessageContentDialog";
import { ChatMessageImageDialog } from "./ChatMessageImageDialog";

interface ChatMessageItemProps {
  message: ChatMessageItemVM;
}

function formatSentTime(isoString: string) {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "";

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

function ChatMessageText({ content }: { content: string }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const target = textRef.current;
    if (!target) return;

    const measure = () => {
      setShowMore(target.scrollHeight > target.clientHeight + 2);
    };

    const raf = requestAnimationFrame(measure);

    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(() => measure());
      observer.observe(target);
      return () => {
        cancelAnimationFrame(raf);
        observer.disconnect();
      };
    }

    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", measure);
    };
  }, [content]);

  return (
    <>
      <p
        ref={textRef}
        className="text-[14px] leading-6 break-words whitespace-pre-wrap text-neutral-900"
        style={{
          display: "-webkit-box",
          WebkitLineClamp: CHAT_MESSAGE_LINE_LIMIT,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {content}
      </p>

      {showMore ? (
        <button
          type="button"
          onClick={() => setIsDialogOpen(true)}
          className="mt-2 text-xs font-medium text-neutral-500 underline underline-offset-2"
        >
          더보기
        </button>
      ) : null}

      <ChatMessageContentDialog
        open={isDialogOpen}
        content={content}
        onOpenChange={setIsDialogOpen}
      />
    </>
  );
}

function ChatMessageImages({ imageUrls }: { imageUrls: string[] }) {
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);

  if (imageUrls.length === 0) return null;

  const gridClass = imageUrls.length === 1 ? "grid-cols-1" : "grid-cols-2";

  return (
    <>
      <div className={`mt-2 grid ${gridClass} gap-2`}>
        {imageUrls.map((url, index) => (
          <button
            key={`${url}-${index}`}
            type="button"
            onClick={() => setSelectedImageUrl(url)}
            className="cursor-zoom-in"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt={`전송 이미지 ${index + 1}`}
              loading="lazy"
              decoding="async"
              className="h-[110px] w-full rounded-xl object-cover"
            />
          </button>
        ))}
      </div>

      <ChatMessageImageDialog
        open={selectedImageUrl !== null}
        imageUrl={selectedImageUrl}
        alt="선택한 이미지 확대 보기"
        onOpenChange={(open) => {
          if (open) return;
          setSelectedImageUrl(null);
        }}
      />
    </>
  );
}

export const ChatMessageItem = memo(function ChatMessageItem({ message }: ChatMessageItemProps) {
  const timeLabel = formatSentTime(message.sentAt);

  if (message.senderType === "AI" || message.senderType === "SYSTEM") {
    return (
      <div className="flex justify-center py-5">
        <div className="rounded-full bg-neutral-200 px-3 py-1 text-xs text-neutral-600">
          {message.content}
        </div>
      </div>
    );
  }

  const showText = Boolean(message.content);
  const showImages = message.imageUrls.length > 0;
  const bubbleClass = showImages
    ? CHAT_MESSAGE_BUBBLE_MAX_WIDTH_CLASS
    : `${CHAT_MESSAGE_BUBBLE_MAX_WIDTH_CLASS} rounded-2xl border border-neutral-200 bg-white px-3 py-2`;

  const bubble = (
    <div className={bubbleClass}>
      {showText ? <ChatMessageText content={message.content ?? ""} /> : null}
      {showImages ? <ChatMessageImages imageUrls={message.imageUrls} /> : null}
    </div>
  );

  if (message.isMine) {
    return (
      <div className="flex flex-row items-end justify-end gap-1">
        {timeLabel ? <span className="text-[11px] text-neutral-400">{timeLabel}</span> : null}
        {bubble}
      </div>
    );
  }

  const avatarLetter = message.senderNickname?.charAt(0).toUpperCase() || "?";

  return (
    <div className="flex items-start gap-2">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-neutral-200 text-xs font-semibold text-neutral-600">
        {message.senderProfile?.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={message.senderProfile.url}
            alt={`${message.senderNickname ?? "사용자"} 프로필 이미지`}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
        ) : (
          <span aria-hidden>{avatarLetter}</span>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col items-start gap-1">
        <span className="text-sm font-medium text-neutral-600">
          {message.senderNickname ?? "사용자"}
        </span>
        <div className="flex flex-row items-end gap-1">
          {bubble}
          {timeLabel ? <span className="text-[11px] text-neutral-400">{timeLabel}</span> : null}
        </div>
      </div>
    </div>
  );
});
