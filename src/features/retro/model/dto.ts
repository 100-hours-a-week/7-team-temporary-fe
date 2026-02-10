import type { RetroCreateFormModel, RetroCreateRequestDto } from "./types";

export function toRetroCreateRequestDto(form: RetroCreateFormModel): RetroCreateRequestDto {
  return {
    reflectionImageIds: form.reflectionImageIds,
    content: form.content.trim(),
  };
}
