const TOKEN_KEY = "molip_at";
const TOKEN_EXP_KEY = "molip_at_exp";

/** 만료 60초 전부터 refresh 필요로 간주 */
const REFRESH_THRESHOLD_MS = 60_000;

function getJwtExp(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1])) as { exp?: unknown };
    return typeof payload.exp === "number" ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

export function saveTokenToSession(token: string): void {
  if (typeof sessionStorage === "undefined") return;
  const exp = getJwtExp(token);
  sessionStorage.setItem(TOKEN_KEY, token);
  if (exp) {
    sessionStorage.setItem(TOKEN_EXP_KEY, String(exp));
  } else {
    sessionStorage.removeItem(TOKEN_EXP_KEY);
  }
}

export function clearTokenFromSession(): void {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_EXP_KEY);
}

/** 유효한 토큰이 있으면 반환, 없거나 만료 임박이면 null */
export function getStoredFreshToken(): string | null {
  if (typeof sessionStorage === "undefined") return null;
  const token = sessionStorage.getItem(TOKEN_KEY);
  const exp = sessionStorage.getItem(TOKEN_EXP_KEY);
  if (!token || !exp) return null;
  if (Number(exp) - Date.now() <= REFRESH_THRESHOLD_MS) return null;
  return token;
}
