"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ToastProvider } from "@/shared/ui/toast";
import { AuthRouteWatcher } from "@/shared/auth/ui/AuthRouteWatcher";
import { useAuthStore } from "@/shared/auth";
import { registerFcmToken } from "@/shared/firebase/registerFcmToken";
import { registerServiceWorker } from "@/shared/pwa/registerServiceWorker";
import { FcmForegroundListener } from "@/shared/firebase/FcmForegroundListener";

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

  const accessToken = useAuthStore((state) => state.accessToken);

  useEffect(() => {
    registerServiceWorker();
  }, []);

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
    </QueryClientProvider>
  );
}
