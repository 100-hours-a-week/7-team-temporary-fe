import { z } from "zod";

import {
  getBirthError,
  getDayEndTimeError,
  getEmailError,
  getGenderError,
  getNicknameError,
  getPasswordError,
  isProfileImageKeyValid,
} from "@/shared/validation";

//regex 검증 규칙
//refine 내가 만든 규칙으로 검증하겠다.

import type { SignUpFormModel } from "./types";
export const signUpFormSchema = z.object({
  email: z.string().superRefine((value, ctx) => {
    const error = getEmailError(value);
    if (!error) return;
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: error });
  }),
  isEmailChecked: z.boolean(),
  password: z.string().superRefine((value, ctx) => {
    const error = getPasswordError(value);
    if (!error) return;
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: error });
  }),
  nickname: z.string().superRefine((value, ctx) => {
    const error = getNicknameError(value);
    if (!error) return;
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: error });
  }),
  gender: z.enum(["MALE", "FEMALE"]).superRefine((value, ctx) => {
    const error = getGenderError(value);
    if (!error) return;
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: error });
  }),
  birth: z.string().superRefine((value, ctx) => {
    const error = getBirthError(value);
    if (!error) return;
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: error });
  }),
  focusTimeZone: z.enum(["MORNING", "AFTERNOON", "EVENING", "NIGHT"]),
  dayEndTime: z.string().superRefine((value, ctx) => {
    const error = getDayEndTimeError(value);
    if (!error) return;
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: error });
  }),
  profileImageKey: z.string().nullable().optional().refine(isProfileImageKeyValid),
  terms: z
    .array(
      z.object({
        termsId: z.number(),
        isAgreed: z.boolean(),
      }),
    )
    .superRefine((terms, ctx) => {
      const requiredIds = [1, 2];
      const hasAllRequired = requiredIds.every(
        (id) => terms.find((term) => term.termsId === id)?.isAgreed,
      );
      if (!hasAllRequired) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "필수 약관에 동의해주세요.",
          path: ["terms"],
        });
      }
    }),
}) satisfies z.ZodType<SignUpFormModel>;

export type SignUpFormErrors = Partial<Record<keyof SignUpFormModel, string>>;

//회원가입 폼에 있는 필드를 key로 만듬
type SignUpFormKey = keyof SignUpFormModel;

//현재 스키마로 받은 key들이 회원가입 폼의 key 필드인지 확인한다.
const isSignUpFormKey = (value: unknown): value is SignUpFormKey =>
  typeof value === "string" && value in signUpFormSchema.shape;

//필드별 에러객체 반환
export const getSignUpFormErrors = (issue: z.ZodError<SignUpFormModel>): SignUpFormErrors => {
  const errors: SignUpFormErrors = {};
  issue.issues.forEach((item) => {
    const key = item.path[0];
    if (!isSignUpFormKey(key) || errors[key]) return;
    errors[key] = item.message;
  });
  return errors;
};

//각각의 필드의 유효성 검사
export const validateSignUpField = <Key extends SignUpFormKey>(
  key: Key,
  value: SignUpFormModel[Key],
) => {
  const fieldSchema = signUpFormSchema.shape[key];
  const result = fieldSchema.safeParse(value);
  return result.success ? undefined : result.error.issues[0]?.message;
};
