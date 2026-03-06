"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useEffect, useRef, useState } from "react";
import { ToastProvider } from "@/shared/ui/toast";
import { ApiError } from "@/shared/api";
import { AuthRouteWatcher } from "@/features/auth";
import { AuthService, configureAuthHandlers } from "@/shared/auth";
import { useAuthStore } from "@/entities/user";
import { registerFcmToken } from "@/shared/firebase/registerFcmToken";
import { registerServiceWorker } from "@/shared/pwa/registerServiceWorker";
import { FcmForegroundListener } from "@/shared/firebase/FcmForegroundListener";
import { useAiArrangeNoticeStore } from "@/features/home";
import { useHomePlanStore } from "@/entities/day-plan";
import { useUserPreferencesStore } from "@/entities/user";
import { chatStompSession } from "@/shared/socket";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  useEffect(() => {
    configureAuthHandlers({
      getAccessToken: () => useAuthStore.getState().accessToken,
      setAuthenticated: (token) => useAuthStore.getState().setAuthenticated(token),
      setUserId: (userId) => useAuthStore.getState().setUserId(userId),
      clearAuth: () => useAuthStore.getState().clearAuth(),
    });
  }, []);

  const accessToken = useAuthStore((state) => state.accessToken);
  const setAuthChecking = useAuthStore((state) => state.setAuthChecking);
  const prevAccessTokenRef = useRef<string | undefined>(accessToken);

  useEffect(() => {
    registerServiceWorker();
  }, []);

  useEffect(() => {
    let cancelled = false;

    const bootstrapAuth = async () => {
      try {
        await AuthService.refresh();
      } catch (error) {
        if (!(error instanceof ApiError && error.httpStatus === 401)) {
          console.warn("[AuthBootstrap] refresh skipped or failed", error);
        }
      } finally {
        if (!cancelled) {
          setAuthChecking(false);
        }
      }
    };

    void bootstrapAuth();

    return () => {
      cancelled = true;
    };
  }, [setAuthChecking]);

  useEffect(() => {
    const prevAccessToken = prevAccessTokenRef.current;
    if (prevAccessToken && !accessToken) {
      queryClient.clear();
      useHomePlanStore.getState().clearHomePlan();
      useAiArrangeNoticeStore.getState().clearExcludedTitles();
      useUserPreferencesStore.getState().setSchedulePreferences({
        dayEndTime: null,
        focusTimeZone: null,
      });
    }
    prevAccessTokenRef.current = accessToken;
  }, [accessToken, queryClient]);

  useEffect(() => {
    if (!accessToken) return;
    if (typeof window === "undefined") return;
    if (!("Notification" in window)) return;
    if (Notification.permission !== "granted") return;
    // FCM 토큰 등록은 AppShell 탭 마운트 정책과 분리된 전역 세션 정책으로 유지한다.

    let cancelled = false;
    const run = async () => {
      const registration = await registerServiceWorker();
      if (!registration || cancelled) return;
      try {
        await registerFcmToken({ promptPermission: false });
      } catch (error) {
        console.error("[FCM] auto register failed", error);
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [accessToken]);

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

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthRouteWatcher />
        <FcmForegroundListener />
        {children}
      </ToastProvider>
      {process.env.NODE_ENV === "development" ? <ReactQueryDevtools initialIsOpen={false} /> : null}
    </QueryClientProvider>
  );
}
