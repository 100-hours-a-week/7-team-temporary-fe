"use client";

import { useEffect, useRef, type ChangeEvent, type KeyboardEvent } from "react";

import { cn } from "@/shared/lib";

import { CHAT_COMPOSER_MAX_LINES } from "../model/constants";

interface ChatMessageComposerProps {
  value: string;
  maxLength: number;
  isExtraMenuOpen: boolean;
  isSendDisabled: boolean;
  onChange: (value: string) => void;
  onSend: () => void;
  onToggleExtraMenu: () => void;
  onImageSelect: (file: File) => void;
}

function getTextareaMaxHeight(textarea: HTMLTextAreaElement) {
  const computed = window.getComputedStyle(textarea);
  const lineHeight = Number.parseFloat(computed.lineHeight) || 24;
  const paddingTop = Number.parseFloat(computed.paddingTop) || 0;
  const paddingBottom = Number.parseFloat(computed.paddingBottom) || 0;
  const borderTop = Number.parseFloat(computed.borderTopWidth) || 0;
  const borderBottom = Number.parseFloat(computed.borderBottomWidth) || 0;
  return (
    lineHeight * CHAT_COMPOSER_MAX_LINES + paddingTop + paddingBottom + borderTop + borderBottom
  );
}

export function ChatMessageComposer({
  value,
  maxLength,
  isExtraMenuOpen,
  isSendDisabled,
  onChange,
  onSend,
  onToggleExtraMenu,
  onImageSelect,
}: ChatMessageComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const target = textareaRef.current;
    if (!target) return;

    target.style.height = "auto";
    const maxHeight = getTextareaMaxHeight(target);
    const nextHeight = Math.min(target.scrollHeight, maxHeight);
    target.style.height = `${nextHeight}px`;
    target.style.overflowY = target.scrollHeight > maxHeight ? "auto" : "hidden";
  }, [value]);

  const handleImageButtonClick = () => {
    imageInputRef.current?.click();
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const [file] = Array.from(event.target.files ?? []);
    if (!file) return;
    onImageSelect(file);
    event.target.value = "";
  };

  const handleTextareaKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== "Enter") return;
    if (event.shiftKey) return;
    if (event.nativeEvent.isComposing) return;

    event.preventDefault();
    if (isSendDisabled) return;
    onSend();
  };

  return (
    <section
      className={cn(
        "rounded-t-2xl border border-neutral-200 bg-white px-3 py-2 shadow-[0_-8px_20px_rgba(0,0,0,0.05)]",
      )}
    >
      <div className="flex items-end gap-2">
        <button
          type="button"
          aria-label="추가 메뉴 열기"
          title="추가 메뉴"
          onClick={onToggleExtraMenu}
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-lg font-medium transition-colors",
            isExtraMenuOpen
              ? "border-neutral-300 bg-neutral-100 text-neutral-700"
              : "border-neutral-200 bg-white text-neutral-500",
          )}
        >
          +
        </button>

        <label
          htmlFor="chat-message-input"
          className="sr-only"
        >
          메시지 입력
        </label>
        <textarea
          id="chat-message-input"
          ref={textareaRef}
          rows={1}
          value={value}
          maxLength={maxLength}
          placeholder="메시지 입력"
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleTextareaKeyDown}
          className="min-h-10 flex-1 resize-none overflow-y-hidden rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm leading-6 text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-300 focus:outline-none"
        />

        <button
          type="button"
          onClick={onSend}
          disabled={isSendDisabled}
          className="h-10 shrink-0 rounded-xl bg-neutral-900 px-4 text-sm font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-400"
        >
          전송
        </button>
      </div>

      <div
        className={cn(
          "grid transition-all duration-200 ease-out",
          isExtraMenuOpen ? "mt-2 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
        aria-hidden={!isExtraMenuOpen}
      >
        <div className="overflow-hidden">
          <div
            className={cn(
              "rounded-xl border border-neutral-200 bg-neutral-50 p-2 transition-transform duration-200 ease-out",
              isExtraMenuOpen ? "translate-y-0" : "translate-y-2",
            )}
          >
            <button
              type="button"
              onClick={handleImageButtonClick}
              className="flex w-full items-center justify-start rounded-lg bg-white px-3 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100"
            >
              사진 보내기
            </button>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
