import { z } from "zod";

import { RETRO_VISIBILITY } from "@/entities/retro";

import {
  RETRO_CONTENT_MAX_HELPER_TEXT,
  RETRO_CONTENT_MAX_LENGTH,
  RETRO_IMAGE_MAX_COUNT,
  RETRO_IMAGE_MIN_COUNT,
} from "./retroWrite.constants";
import type { RetroCreateFormModel } from "./types";

export const retroCreateFormSchema: z.ZodType<RetroCreateFormModel> = z.object({
  reflectionImageIds: z.array(z.number().int().positive()).max(RETRO_IMAGE_MAX_COUNT),
  uploadedImageKeys: z
    .array(z.string().min(1))
    .min(RETRO_IMAGE_MIN_COUNT)
    .max(RETRO_IMAGE_MAX_COUNT),
  content: z.string().max(RETRO_CONTENT_MAX_LENGTH, RETRO_CONTENT_MAX_HELPER_TEXT),
  visibility: z.enum([RETRO_VISIBILITY.PUBLIC, RETRO_VISIBILITY.PRIVATE]),
});
