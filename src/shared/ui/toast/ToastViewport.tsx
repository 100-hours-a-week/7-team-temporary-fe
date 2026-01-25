"use client";

import { createPortal } from "react-dom";
import type { Toast } from "./types";
import { ToastMessage } from "./ToastMessage";
import { useEffect, useState } from "react";

interface ToastViewportProps {
  toasts: Toast[];
}

export function ToastViewport({ toasts }: ToastViewportProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return createPortal(
    <div className="fixed bottom-18 z-50 flex w-full max-w-[408px] flex-col gap-2">
      {toasts.map((toast) => (
        <ToastMessage
          key={toast.id}
          toast={toast}
        />
      ))}
    </div>,
    document.body,
  );
}
