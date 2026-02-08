import { ApiError, apiFetch, Endpoint } from "@/shared/api";
import { clearAuth, setAuthenticated } from "./auth.handlers";

export const AuthService = {
  async refresh() {
    try {
      console.log("[AuthService] refresh start");
      const res = await apiFetch<{ accessToken: string }>(Endpoint.TOKEN.REFRESH, {
        method: "PUT",
      });

      setAuthenticated(res.accessToken);
      console.log("[AuthService] refresh success");
      return res.accessToken;
    } catch (e) {
      console.warn("[AuthService] refresh failed", e);
      clearAuth();
      throw e;
    }
  },

  async refreshAndRetry<T>(request: () => Promise<T>) {
    try {
      return await request();
    } catch (e) {
      const isUnauthorized =
        e instanceof ApiError
          ? e.httpStatus === 401
          : typeof e === "object" &&
            e !== null &&
            "httpStatus" in e &&
            (e as ApiError).httpStatus === 401;

      if (isUnauthorized) {
        console.log("[AuthService] 401 detected, try refresh");
        const refreshed = await AuthService.refresh();
        if (refreshed) {
          console.log("[AuthService] retry after refresh");
          return await request();
        }
      }
      throw e;
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
