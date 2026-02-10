import { ApiError, apiFetch, Endpoint } from "@/shared/api";
import { clearAuth, setAuthenticated } from "./auth.handlers";

let refreshPromise: Promise<string> | null = null;

function isUnauthorizedError(error: unknown) {
  if (error instanceof ApiError) return error.httpStatus === 401;
  if (typeof error === "object" && error !== null && "httpStatus" in error) {
    return (error as ApiError).httpStatus === 401;
  }
  return false;
}

export const AuthService = {
  async refresh() {
    if (!refreshPromise) {
      refreshPromise = (async () => {
        try {
          console.log("[AuthService] refresh start");
          const res = await apiFetch<{ accessToken: string }>(Endpoint.TOKEN.REFRESH, {
            method: "PUT",
            credentials: "include",
          });

          setAuthenticated(res.accessToken);
          console.log("[AuthService] refresh success");
          return res.accessToken;
        } catch (e) {
          console.warn("[AuthService] refresh failed", e);
          clearAuth();
          throw e;
        } finally {
          refreshPromise = null;
        }
      })();
    } else {
      console.log("[AuthService] refresh join in-flight request");
    }

    return refreshPromise;
  },

  async ensureRefreshed() {
    return AuthService.refresh();
  },

  async refreshAndRetry<T>(request: () => Promise<T>) {
    try {
      return await request();
    } catch (error) {
      if (!isUnauthorizedError(error)) {
        throw error;
      }

      console.log("[AuthService] 401 detected, try refresh");
      await AuthService.ensureRefreshed();

      try {
        console.log("[AuthService] retry after refresh");
        return await request();
      } catch (retryError) {
        if (isUnauthorizedError(retryError)) {
          clearAuth();
        }
        throw retryError;
      }
    }
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
