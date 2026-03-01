import { useMutation } from "@tanstack/react-query";

import type { WeeklyButlerChatRequestDto } from "./weeklyButlerChat.types";

const MOCK_DELAY_MS = 800;

export function useWeeklyButlerSendMockMutation() {
  return useMutation({
    mutationFn: (_dto: WeeklyButlerChatRequestDto): Promise<void> =>
      new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS)),
  });
}
