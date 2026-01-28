"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useAuthStore } from "@/shared/auth";

const PUBLIC_PATHS = ["/login", "/sign-up"];
const DEFAULT_PUBLIC_REDIRECT = "/home";

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

export function AuthRouteWatcher() {
  const router = useRouter();
  const pathname = usePathname();
  const accessToken = useAuthStore((state) => state.accessToken);
  const hasMountedRef = useRef(false);

  useEffect(() => {
    if (!pathname) return;

    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }

    const isPublic = isPublicPath(pathname);

    if (!accessToken && !isPublic) {
      router.replace(PUBLIC_PATHS[0]);
      return;
    }

    if (accessToken && isPublic) {
      router.replace(DEFAULT_PUBLIC_REDIRECT);
    }
  }, [accessToken, pathname, router]);

  return null;
}
