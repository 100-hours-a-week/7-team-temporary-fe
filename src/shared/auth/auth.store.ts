import { create } from "zustand";

export interface AuthState {
  accessToken?: string;
  isAuthenticated: boolean;
  suppressPublicRedirect: boolean;
  setAuthenticated: (token: string) => void;
  clearAuth: () => void;
  setSuppressPublicRedirect: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: undefined,
  isAuthenticated: false,
  suppressPublicRedirect: false,
  setAuthenticated: (token) => set({ accessToken: token, isAuthenticated: true }),
  clearAuth: () => set({ accessToken: undefined, isAuthenticated: false }),
  setSuppressPublicRedirect: (value) => set({ suppressPublicRedirect: value }),
}));
