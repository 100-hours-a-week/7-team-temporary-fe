import { RETRO_VISIBILITY } from "@/entities/retro";

import type { RetroCreateFormModel, RetroCreateRequestDto } from "./types";

export function toRetroCreateRequestDto(form: RetroCreateFormModel): RetroCreateRequestDto {
  return {
    reflectionImageIds: form.reflectionImageIds,
    content: form.content.trim(),
    isPublic: form.visibility === RETRO_VISIBILITY.PUBLIC,
  };
}
