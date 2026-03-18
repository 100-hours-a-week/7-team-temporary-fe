"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/entities/user";
import { useUserPreferencesStore } from "@/entities/user";
import { useHomePlanStore } from "@/entities/day-plan";
import { useAiArrangeNoticeStore } from "@/features/ai-arrange";
import { chatStompSession } from "@/shared/socket";
import { useToast } from "@/shared/ui/toast";

interface ProtectedLayoutEffectsProps {
  children: ReactNode;
}

export default function ProtectedLayoutEffects({ children }: ProtectedLayoutEffectsProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const prevIsAuthenticatedRef = useRef<boolean>(isAuthenticated);

  useEffect(() => {
    const prev = prevIsAuthenticatedRef.current;
    if (prev && !isAuthenticated) {
      queryClient.clear();
      useHomePlanStore.getState().clearHomePlan();
      useAiArrangeNoticeStore.getState().clearExcludedTitles();
      useUserPreferencesStore.getState().setSchedulePreferences({
        dayEndTime: null,
        focusTimeZone: null,
      });
    }
    prevIsAuthenticatedRef.current = isAuthenticated;
  }, [isAuthenticated, queryClient]);

  useEffect(() => {
    if (!isAuthenticated) {
      chatStompSession.stop({
        code: "LOGOUT",
        message: "로그아웃으로 연결을 종료합니다.",
      });
      return;
    }

    chatStompSession.start();
  }, [isAuthenticated]);

  useEffect(() => {
    return () => {
      chatStompSession.stop({
        code: "APP_UNMOUNT",
        message: "앱 언마운트로 연결을 종료합니다.",
      });
    };
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    if (typeof window === "undefined") return;
    if (!("Notification" in window)) return;
    if (Notification.permission !== "granted") return;

    let cancelled = false;
    const run = async () => {
      if (cancelled) return;
      const { registerFcmToken } = await import("@/shared/firebase/registerFcmToken");
      if (cancelled) return;
      await registerFcmToken({ promptPermission: false });
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  useEffect(() => {
    let cancelled = false;
    let unsubscribe: (() => void) | null = null;

    const run = async () => {
      const [{ getFirebaseMessaging }, { onMessage }] = await Promise.all([
        import("@/shared/firebase/firebase"),
        import("firebase/messaging"),
      ]);
      const messaging = await getFirebaseMessaging();
      if (!messaging || cancelled) return;

      unsubscribe = onMessage(messaging, (payload) => {
        const title = payload.data?.title ?? payload.notification?.title ?? "MOLIP";
        const body =
          payload.data?.content ?? payload.data?.body ?? payload.notification?.body ?? "";
        showToast(body ? `${title} - ${body}` : title, "info");
      });
    };

    void run();

    return () => {
      cancelled = true;
      if (unsubscribe) unsubscribe();
    };
  }, [showToast]);

  return <>{children}</>;
}
