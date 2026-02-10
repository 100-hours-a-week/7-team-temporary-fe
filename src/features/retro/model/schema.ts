import { z } from "zod";

import { RETRO_VISIBILITY } from "@/entities/retro";

import type { RetroCreateFormModel } from "./types";

export const retroCreateFormSchema: z.ZodType<RetroCreateFormModel> = z.object({
  reflectionImageIds: z.array(z.number().int().positive()),
  content: z.string(),
  visibility: z.enum([RETRO_VISIBILITY.PUBLIC, RETRO_VISIBILITY.PRIVATE]),
});
