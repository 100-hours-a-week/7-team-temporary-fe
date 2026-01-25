"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

import { ToastViewport } from "./ToastViewport";

import type { Toast, ToastType } from "./types";

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

/**
 * 전역 Toast Provider
 * - 토스트 상태를 전역으로 관리
 * - showToast 함수를 하위 컴포넌트에 제공
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    const id = crypto.randomUUID();

    setToasts((prev) => [...prev, { id, message, type, duration: 3000 }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      <ToastViewport toasts={toasts} />
    </ToastContext.Provider>
  );
}

/**
 * Toast Context를 안전하게 사용하기 위한 커스텀 훅
 */
export function useToastContext() {
  const ctx = useContext(ToastContext);

  if (!ctx) {
    throw new Error("useToast는 ToastProvider 내에서 사용되어야 합니다.");
  }

  return ctx;
}
