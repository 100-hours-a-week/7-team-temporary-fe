import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { AUTH_LOGIN_PATH, isAuthPublicPath } from "@/shared/auth/auth.routes";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasRefreshToken = request.cookies.has("refreshToken");

  if (!isAuthPublicPath(pathname) && !hasRefreshToken) {
    return NextResponse.redirect(new URL(AUTH_LOGIN_PATH, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
