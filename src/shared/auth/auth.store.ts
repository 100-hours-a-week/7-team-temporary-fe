import { create } from "zustand";

export interface AuthState {
  accessToken?: string;
  isAuthenticated: boolean;
  setAuthenticated: (token: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: undefined,
  isAuthenticated: false,
  setAuthenticated: (token) => set({ accessToken: token, isAuthenticated: true }),
  clearAuth: () => set({ accessToken: undefined, isAuthenticated: false }),
}));
