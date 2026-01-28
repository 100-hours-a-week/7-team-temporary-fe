import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const PUBLIC_PATHS = ["/login", "/sign-up"];
const DEFAULT_PUBLIC_REDIRECT = "/home";

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

export function middleware(request: NextRequest) {
  if (process.env.NODE_ENV === "development") {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;
  const hasRefreshToken = request.cookies.has("refreshToken");

  if (isPublicPath(pathname) && hasRefreshToken) {
    return NextResponse.redirect(new URL(DEFAULT_PUBLIC_REDIRECT, request.url));
  }

  if (!isPublicPath(pathname) && !hasRefreshToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
