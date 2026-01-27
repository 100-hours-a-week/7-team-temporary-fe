import { z } from "zod";

import { isPasswordValid, PASSWORD_ERRORS } from "@/shared/validation";

import type { PasswordChangeFormModel } from "./types";

export const passwordChangeSchema = z
  .object({
    password: z.string().refine(isPasswordValid, PASSWORD_ERRORS.INVALID_LENGTH),
    passwordConfirm: z.string().min(1, "비밀번호 확인을 입력해주세요."),
  })
  .refine((value) => value.password === value.passwordConfirm, {
    path: ["passwordConfirm"],
    message: "비밀번호가 일치하지 않습니다.",
  }) satisfies z.ZodType<PasswordChangeFormModel>;
