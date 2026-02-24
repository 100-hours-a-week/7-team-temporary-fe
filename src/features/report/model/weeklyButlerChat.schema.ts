import { WEEKLY_BUTLER_CHAT_MAX_SEND_COUNT } from "./weeklyButler.constants";

import type { WeeklyButlerChatFormModel } from "./weeklyButlerChat.types";

export function isWeeklyButlerChatSendable(form: WeeklyButlerChatFormModel): boolean {
  return form.message.trim().length > 0;
}

export function isWeeklyButlerChatLimitReached(sentCount: number): boolean {
  return sentCount >= WEEKLY_BUTLER_CHAT_MAX_SEND_COUNT;
}
