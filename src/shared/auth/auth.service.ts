import { ApiError, apiFetch, Endpoint } from "@/shared/api";
import { clearAuth, setAuthenticated } from "./auth.handlers";

let refreshPromise: Promise<void> | null = null;
let cachedDeviceId: string | null = null;

export function getDeviceId(): string | null {
  return cachedDeviceId;
}

function isUnauthorizedError(error: unknown) {
  if (error instanceof ApiError) return error.httpStatus === 401;
  if (typeof error === "object" && error !== null && "httpStatus" in error) {
    return (error as ApiError).httpStatus === 401;
  }
  return false;
}

/**
 * AT HttpOnly 쿠키가 유효한지 서버 사이드에서 확인한다.
 * 유효하면 true, 만료/없으면 false.
 */
async function checkAuthCookie(): Promise<boolean> {
  try {
    const res = await fetch("/api/socket-token", { credentials: "include" });
    if (!res.ok) return false;
    const json = (await res.json()) as { deviceId?: string | null };
    cachedDeviceId = json.deviceId ?? null;
    return true;
  } catch {
    return false;
  }
}

export const AuthService = {
  async refresh() {
    if (!refreshPromise) {
      refreshPromise = (async () => {
        try {
          await apiFetch<unknown>(Endpoint.TOKEN.REFRESH, {
            method: "PUT",
            credentials: "include",
          });
          await checkAuthCookie();
          setAuthenticated();
        } catch (e) {
          console.warn("[AuthService] refresh failed", e);
          clearAuth();
          throw e;
        } finally {
          refreshPromise = null;
        }
      })();
    }

    return refreshPromise;
  },

  async refreshAndRetry<T>(request: () => Promise<T>) {
    try {
      return await request();
    } catch (error) {
      if (!isUnauthorizedError(error)) {
        throw error;
      }

      await AuthService.refresh();

      try {
        return await request();
      } catch (retryError) {
        if (isUnauthorizedError(retryError)) {
          clearAuth();
        }
        throw retryError;
      }
    }
  },

  /**
   * 페이지 리로드 시 AT 쿠키가 아직 유효하면 refresh 없이 인증 상태를 복원한다.
   * 유효하지 않으면 false를 반환하고 caller가 refresh()를 시도해야 한다.
   */
  async restoreFromCookie(): Promise<boolean> {
    const ok = await checkAuthCookie();
    if (!ok) return false;
    setAuthenticated();
    return true;
  },

  async logout() {
    try {
      await apiFetch<void>(Endpoint.TOKEN.BASE, { method: "DELETE", authRequired: true });
    } catch (error) {
      console.warn("[AuthService] logout failed", error);
    } finally {
      clearAuth();
    }
  },
};
