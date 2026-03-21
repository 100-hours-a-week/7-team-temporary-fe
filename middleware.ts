import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  AUTH_DEFAULT_AUTHENTICATED_PATH,
  AUTH_LOGIN_PATH,
  isAuthPublicPath,
} from "@/shared/auth/auth.routes";

const AUTH_HINT_COOKIE = "auth_hint";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasRefreshToken = request.cookies.has("refreshToken");

  if (!isAuthPublicPath(pathname) && !hasRefreshToken) {
    const response = NextResponse.redirect(new URL(AUTH_LOGIN_PATH, request.url));
    response.cookies.delete(AUTH_HINT_COOKIE);
    return response;
  }

  // 인증된 유저가 공개 페이지(login 등)나 루트(/)에 접근하면 서버에서 바로 리다이렉트.
  // 클라이언트 AuthRouteWatcher의 리다이렉트를 건너뛰어 로딩 화면을 제거한다.
  if (hasRefreshToken && (isAuthPublicPath(pathname) || pathname === "/")) {
    return NextResponse.redirect(new URL(AUTH_DEFAULT_AUTHENTICATED_PATH, request.url));
  }

  // refreshToken이 있는 보호 경로: auth_hint 쿠키를 세팅해 클라이언트가
  // isAuthChecking 로딩 없이 SSR 콘텐츠를 즉시 렌더할 수 있도록 한다.
  const response = NextResponse.next();
  response.cookies.set(AUTH_HINT_COOKIE, "1", {
    httpOnly: false,
    sameSite: "strict",
    path: "/",
  });
  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
