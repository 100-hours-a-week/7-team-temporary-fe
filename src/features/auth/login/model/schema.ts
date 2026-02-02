import { z } from "zod";

import { getEmailError, getPasswordError } from "@/shared/validation";

import type { LoginFormModel } from "./types";

export const loginFormSchema = z.object({
  email: z.string().superRefine((value, ctx) => {
    const error = getEmailError(value);
    if (!error) return;
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: error });
  }),
  password: z.string().superRefine((value, ctx) => {
    const error = getPasswordError(value);
    if (!error) return;
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: error });
  }),
}) satisfies z.ZodType<LoginFormModel>;
