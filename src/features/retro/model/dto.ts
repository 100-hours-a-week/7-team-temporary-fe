import { RETRO_VISIBILITY } from "@/entities/retro";

import type { RetroCreateFormModel, RetroCreateRequestDto } from "./types";

export function toRetroCreateRequestDto(form: RetroCreateFormModel): RetroCreateRequestDto {
  return {
    reflectionImageKeys: form.imageKeys,
    content: form.content.trim(),
    isOpen: form.visibility === RETRO_VISIBILITY.PUBLIC,
  };
}
