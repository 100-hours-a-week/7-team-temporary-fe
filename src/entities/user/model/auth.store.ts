import { create } from "zustand";

export interface AuthState {
  accessToken?: string;
  userId?: number;
  isAuthenticated: boolean;
  isAuthChecking: boolean;
  suppressPublicRedirect: boolean;
  setAuthenticated: (token: string) => void;
  setUserId: (userId: number) => void;
  clearAuth: () => void;
  setSuppressPublicRedirect: (value: boolean) => void;
  setAuthChecking: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: undefined,
  userId: undefined,
  isAuthenticated: false,
  isAuthChecking: true,
  suppressPublicRedirect: false,
  setAuthenticated: (token) =>
    set({ accessToken: token, isAuthenticated: true, isAuthChecking: false }),
  setUserId: (userId) => set({ userId }),
  clearAuth: () =>
    set({
      accessToken: undefined,
      userId: undefined,
      isAuthenticated: false,
      isAuthChecking: false,
    }),
  setSuppressPublicRedirect: (value) => set({ suppressPublicRedirect: value }),
  setAuthChecking: (value) => set({ isAuthChecking: value }),
}));
