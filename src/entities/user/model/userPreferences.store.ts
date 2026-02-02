import { create } from "zustand";

import type { UserDayEndTime, UserFocusTimeZone } from "./types";

interface UserPreferencesState {
  dayEndTime: UserDayEndTime | null;
  focusTimeZone: UserFocusTimeZone | null;
  setSchedulePreferences: (payload: {
    dayEndTime?: UserDayEndTime | null;
    focusTimeZone?: UserFocusTimeZone | null;
  }) => void;
}

export const useUserPreferencesStore = create<UserPreferencesState>((set) => ({
  dayEndTime: null,
  focusTimeZone: null,
  setSchedulePreferences: (payload) =>
    set((state) => ({
      ...state,
      ...payload,
    })),
}));
