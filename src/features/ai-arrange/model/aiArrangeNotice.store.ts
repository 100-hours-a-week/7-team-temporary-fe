import { create } from "zustand";

interface AiArrangeNoticeState {
  excludedTitles: string[];
  setExcludedTitles: (titles: string[]) => void;
  clearExcludedTitles: () => void;
}

export const useAiArrangeNoticeStore = create<AiArrangeNoticeState>((set) => ({
  excludedTitles: [],
  setExcludedTitles: (titles) => set({ excludedTitles: titles }),
  clearExcludedTitles: () => set({ excludedTitles: [] }),
}));
