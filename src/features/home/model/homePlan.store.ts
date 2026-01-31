import { create } from "zustand";

interface HomePlanState {
  dayPlanId: number | null;
  date: string | null;
  setHomePlan: (dayPlanId: number, date: string) => void;
  setDate: (date: string | null) => void;
  clearHomePlan: () => void;
}

export const useHomePlanStore = create<HomePlanState>((set) => ({
  dayPlanId: null,
  date: null,
  setHomePlan: (dayPlanId, date) => set({ dayPlanId, date }),
  setDate: (date) => set((state) => ({ ...state, date })),
  clearHomePlan: () => set({ dayPlanId: null, date: null }),
}));
