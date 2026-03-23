"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useEffect, useState } from "react";
import { AuthRouteWatcher } from "./_components/AuthRouteWatcher";
import { ToastProvider } from "@/shared/ui/toast";
import { ApiError } from "@/shared/api";
import { AuthService, configureAuthHandlers } from "@/shared/auth";
import { useAuthStore } from "@/entities/user";
import { registerServiceWorker } from "@/shared/pwa/registerServiceWorker";
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
      setAuthenticated: () => useAuthStore.getState().setAuthenticated(),
      setUserId: (userId) => useAuthStore.getState().setUserId(userId),
      clearAuth: () => useAuthStore.getState().clearAuth(),
    });
  }, []);

  const setAuthChecking = useAuthStore((state) => state.setAuthChecking);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const supportsIdleCallback =
      typeof window.requestIdleCallback === "function" &&
      typeof window.cancelIdleCallback === "function";
    let cancelled = false;
    let handle: number | null = null;

    const run = () => {
      if (cancelled) return;
      void registerServiceWorker();
    };

    if (supportsIdleCallback) {
      handle = window.requestIdleCallback(run, { timeout: 2000 });
    } else {
      handle = window.setTimeout(run, 400);
    }

    return () => {
      cancelled = true;
      if (handle === null) return;
      if (supportsIdleCallback) {
        window.cancelIdleCallback(handle);
        return;
      }
      window.clearTimeout(handle);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const bootstrapAuth = async () => {
      try {
        // 1순위: AT 쿠키가 살아있으면 refresh 없이 복원 (네트워크 1회)
        // restoreFromCookie()가 cachedDeviceId를 세팅한 뒤 setAuthenticated()를 호출한다.
        // auth_hint 최적화로 isAuthenticated가 이미 true이면 상태 변화가 없어
        // ProtectedLayoutEffects의 effect가 재실행되지 않으므로 여기서 직접 start()를 호출한다.
        if (await AuthService.restoreFromCookie()) {
          chatStompSession.start();
          return;
        }
        // 2순위: RT 쿠키로 AT 재발급
        await AuthService.refresh();
        chatStompSession.start();
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

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthRouteWatcher />
        {children}
      </ToastProvider>
      {process.env.NODE_ENV === "development" ? <ReactQueryDevtools initialIsOpen={false} /> : null}
    </QueryClientProvider>
  );
}
