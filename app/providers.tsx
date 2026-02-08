"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useEffect, useRef, useState } from "react";
import { ToastProvider } from "@/shared/ui/toast";
import { AuthRouteWatcher } from "@/features/auth";
import { configureAuthHandlers } from "@/shared/auth";
import { useAuthStore } from "@/entities/user";
import { registerFcmToken } from "@/shared/firebase/registerFcmToken";
import { registerServiceWorker } from "@/shared/pwa/registerServiceWorker";
import { FcmForegroundListener } from "@/shared/firebase/FcmForegroundListener";
import { useAiArrangeNoticeStore } from "@/features/home";
import { useHomePlanStore } from "@/entities/day-plan";
import { useUserPreferencesStore } from "@/entities/user";

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
      clearAuth: () => useAuthStore.getState().clearAuth(),
    });
  }, []);

  const accessToken = useAuthStore((state) => state.accessToken);
  const prevAccessTokenRef = useRef<string | undefined>(accessToken);

  useEffect(() => {
    registerServiceWorker();
  }, []);

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
