"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useAuthStore } from "@/entities/user";
import { AUTH_DEFAULT_AUTHENTICATED_PATH, AUTH_LOGIN_PATH, isAuthPublicPath } from "@/shared/auth";

export function AuthRouteWatcher() {
  const router = useRouter();
  const pathname = usePathname();
  const accessToken = useAuthStore((state) => state.accessToken);
  const isAuthChecking = useAuthStore((state) => state.isAuthChecking);
  const suppressPublicRedirect = useAuthStore((state) => state.suppressPublicRedirect);

  useEffect(() => {
    if (!pathname) return;
    if (isAuthChecking) return;

    const isPublic = isAuthPublicPath(pathname);

    if (!accessToken && !isPublic) {
      router.replace(AUTH_LOGIN_PATH);
      return;
    }

    if (accessToken && isPublic && !suppressPublicRedirect) {
      router.replace(AUTH_DEFAULT_AUTHENTICATED_PATH);
    }
  }, [accessToken, isAuthChecking, pathname, router, suppressPublicRedirect]);

  return null;
}
