"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";

import { PrimaryButton } from "@/shared/ui/button";

interface DeleteChatRoomConfirmOverlayProps {
  open: boolean;
  title: string;
  isPending: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function DeleteChatRoomConfirmOverlay({
  open,
  title,
  isPending,
  onCancel,
  onConfirm,
}: DeleteChatRoomConfirmOverlayProps) {
  useEffect(() => {
    if (!open) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (isPending) return;
      onCancel();
    };

    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isPending, onCancel, open]);

  if (!open) return null;
  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => {
          if (isPending) return;
          onCancel();
        }}
      />
      <section className="relative z-10 w-full max-w-[300px] rounded-3xl bg-white px-6 pt-6 pb-6 text-center">
        <h2 className="text-md mx-auto my-4 inline-block max-w-[260px] font-semibold break-keep text-neutral-900">
          {title}
        </h2>
        <div className="mt-6 flex gap-3">
          <PrimaryButton
            className="w-full bg-neutral-100 text-neutral-500 hover:bg-neutral-100"
            disabled={isPending}
            onClick={onCancel}
          >
            취소
          </PrimaryButton>
          <PrimaryButton
            className="bg-primary-700 hover:bg-primary-700 w-full text-white"
            disabled={isPending}
            onClick={onConfirm}
          >
            {isPending ? "삭제 중..." : "삭제"}
          </PrimaryButton>
        </div>
      </section>
    </div>,
    document.body,
  );
}
