"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";

interface ImageDialogProps {
  open: boolean;
  imageUrl: string | null;
  alt: string;
  onOpenChange: (open: boolean) => void;
}

export function ImageDialog({ open, imageUrl, alt, onOpenChange }: ImageDialogProps) {
  useEffect(() => {
    if (!open) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      onOpenChange(false);
    };

    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [onOpenChange, open]);

  if (!open || !imageUrl) return null;
  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/55"
        onClick={() => onOpenChange(false)}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageUrl}
        alt={alt}
        className="relative z-10 max-h-[56vh] w-auto max-w-[calc(100vw-4rem)] rounded-xl object-contain"
      />
    </div>,
    document.body,
  );
}
