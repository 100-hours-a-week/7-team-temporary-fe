import { create } from "zustand";

interface HomePlanState {
  dayPlanId: number | null;
  date: string | null;
  setHomePlan: (dayPlanId: number, date: string) => void;
  clearHomePlan: () => void;
}

export const useHomePlanStore = create<HomePlanState>((set) => ({
  dayPlanId: null,
  date: null,
  setHomePlan: (dayPlanId, date) => set({ dayPlanId, date }),
  clearHomePlan: () => set({ dayPlanId: null, date: null }),
}));
