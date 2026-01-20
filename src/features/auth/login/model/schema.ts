import { z } from "zod";

import { isEmailValid, isPasswordValid } from "@/shared/validation";

import type { LoginFormModel } from "./types";
import { PASSWORD_ERRORS } from "@/shared/validation/password";
import { EMAIL_ERRORS } from "@/shared/validation/email";

export const loginFormSchema = z.object({
  email: z.string().trim().refine(isEmailValid, EMAIL_ERRORS.INVALID_FORMAT),
  password: z.string().refine(isPasswordValid, PASSWORD_ERRORS.INVALID_LENGTH),
}) satisfies z.ZodType<LoginFormModel>;
