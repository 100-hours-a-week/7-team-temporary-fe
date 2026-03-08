"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";

import { useAuthStore } from "@/entities/user";
import { FcmForegroundListener } from "@/shared/firebase/FcmForegroundListener";
import { registerFcmToken } from "@/shared/firebase/registerFcmToken";
import { chatStompSession } from "@/shared/socket";

interface ProtectedLayoutProps {
  children: ReactNode;
}

export default function ProtectedLayout({ children }: ProtectedLayoutProps) {
  const accessToken = useAuthStore((state) => state.accessToken);

  useEffect(() => {
    if (!accessToken) {
      chatStompSession.stop({
        code: "LOGOUT",
        message: "로그아웃으로 연결을 종료합니다.",
      });
      return;
    }

    chatStompSession.start(accessToken);
  }, [accessToken]);

  useEffect(() => {
    return () => {
      chatStompSession.stop({
        code: "APP_UNMOUNT",
        message: "앱 언마운트로 연결을 종료합니다.",
      });
    };
  }, []);

  useEffect(() => {
    if (!accessToken) return;
    if (typeof window === "undefined") return;
    if (!("Notification" in window)) return;
    if (Notification.permission !== "granted") return;

    let cancelled = false;
    const run = async () => {
      if (cancelled) return;
      await registerFcmToken({ promptPermission: false });
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [accessToken]);

  return (
    <>
      <FcmForegroundListener />
      {children}
    </>
  );
}
