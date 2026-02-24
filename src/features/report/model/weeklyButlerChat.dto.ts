import type {
  WeeklyButlerChatFormModel,
  WeeklyButlerChatRequestDto,
} from "./weeklyButlerChat.types";

export function toWeeklyButlerChatRequestDto(
  form: WeeklyButlerChatFormModel,
): WeeklyButlerChatRequestDto {
  return {
    inputMessage: form.message.trim(),
  };
}
