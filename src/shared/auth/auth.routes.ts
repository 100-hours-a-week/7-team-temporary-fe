export const AUTH_PUBLIC_PATHS = ["/login", "/sign-up"] as const;
export const AUTH_LOGIN_PATH = AUTH_PUBLIC_PATHS[0];
export const AUTH_DEFAULT_AUTHENTICATED_PATH = "/home";

export function isAuthPublicPath(pathname: string) {
  return AUTH_PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}
