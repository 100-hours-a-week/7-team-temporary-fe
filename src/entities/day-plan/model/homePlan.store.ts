import { create } from "zustand";

interface HomePlanState {
  dayPlanId: number | null;
  date: string | null;
  aiUsageRemainingCount: number | null;
  setHomePlan: (dayPlanId: number, date: string) => void;
  setAiUsageRemainingCount: (count: number | null) => void;
  setDate: (date: string | null) => void;
  clearHomePlan: () => void;
}

export const useHomePlanStore = create<HomePlanState>((set) => ({
  dayPlanId: null,
  date: null,
  aiUsageRemainingCount: null,
  setHomePlan: (dayPlanId, date) => set({ dayPlanId, date }),
  setAiUsageRemainingCount: (count) => set({ aiUsageRemainingCount: count }),
  setDate: (date) => set((state) => ({ ...state, date })),
  clearHomePlan: () => set({ dayPlanId: null, date: null, aiUsageRemainingCount: null }),
}));
