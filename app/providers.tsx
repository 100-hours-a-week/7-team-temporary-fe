"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useEffect, useState } from "react";
import { ToastProvider } from "@/shared/ui/toast";
import { ApiError } from "@/shared/api";
import { AuthRouteWatcher } from "@/features/auth";
import { AuthService, configureAuthHandlers } from "@/shared/auth";
import { useAuthStore } from "@/entities/user";
import { registerServiceWorker } from "@/shared/pwa/registerServiceWorker";

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
    registerServiceWorker();
  }, []);

  useEffect(() => {
    let cancelled = false;

    const bootstrapAuth = async () => {
      try {
        // 1순위: AT 쿠키가 살아있으면 refresh 없이 복원 (네트워크 1회)
        if (await AuthService.restoreFromCookie()) return;
        // 2순위: RT 쿠키로 AT 재발급
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
