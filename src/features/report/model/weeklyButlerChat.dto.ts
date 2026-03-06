import type {
  WeeklyButlerChatFormModel,
  WeeklyButlerChatRequestDto,
} from "./weeklyButlerChat.types";

export function toWeeklyButlerChatRequestDto(
  form: WeeklyButlerChatFormModel,
  reportId: number,
): WeeklyButlerChatRequestDto {
  return {
    reportId,
    inputMessage: form.message.trim(),
  };
}
