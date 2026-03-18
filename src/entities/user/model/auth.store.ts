import { create } from "zustand";

export interface AuthState {
  userId?: number;
  isAuthenticated: boolean;
  isAuthChecking: boolean;
  suppressPublicRedirect: boolean;
  setAuthenticated: () => void;
  setUserId: (userId: number) => void;
  clearAuth: () => void;
  setSuppressPublicRedirect: (value: boolean) => void;
  setAuthChecking: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  userId: undefined,
  isAuthenticated: false,
  isAuthChecking: true,
  suppressPublicRedirect: false,
  setAuthenticated: () => set({ isAuthenticated: true, isAuthChecking: false }),
  setUserId: (userId) => set({ userId }),
  clearAuth: () =>
    set({
      userId: undefined,
      isAuthenticated: false,
      isAuthChecking: false,
    }),
  setSuppressPublicRedirect: (value) => set({ suppressPublicRedirect: value }),
  setAuthChecking: (value) => set({ isAuthChecking: value }),
}));
