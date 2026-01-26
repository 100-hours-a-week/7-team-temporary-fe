import { apiFetch, Endpoint } from "@/shared/api";
import { useAuthStore } from "./auth.store";

export const AuthService = {
  async refresh() {
    try {
      const res = await apiFetch<{ accessToken: string }>(Endpoint.TOKEN.REFRESH, {
        method: "PUT",
      });

      useAuthStore.getState().setAuthenticated(res.accessToken);
      return res.accessToken;
    } catch (e) {
      useAuthStore.getState().clearAuth();
      throw e;
    }
  },

  logout() {
    useAuthStore.getState().clearAuth();
  },
};
