import { z } from "zod";

import {
  BIRTH_DATE_REGEX,
  isBirthValid,
  isDayEndTimeValid,
  isEmailValid,
  isGenderValid,
  isNicknameValid,
  isPasswordValid,
  isProfileImageKeyValid,
} from "@/shared/validation";

import type { SignUpFormModel } from "./types";

export const signUpFormSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "이메일을 입력해주세요.")
    .refine(isEmailValid, "이메일 형식이 올바르지 않습니다."),
  password: z
    .string()
    .min(1, "비밀번호를 입력해주세요.")
    .refine(isPasswordValid, "비밀번호는 8~20자, 대/소문자, 숫자, 특수문자를 포함해야 합니다."),
  nickname: z
    .string()
    .min(1, "닉네임을 입력해주세요.")
    .max(10, "닉네임은 최대 10자까지 입력할 수 있습니다.")
    .refine(isNicknameValid, "닉네임은 한글 또는 영문자만 입력할 수 있습니다."),
  gender: z.enum(["MALE", "FEMALE"]).refine(isGenderValid, "성별을 선택해주세요."),
  birth: z
    .string()
    .regex(BIRTH_DATE_REGEX, "생년월일은 YYYY.MM.DD 형식이어야 합니다.")
    .refine(isBirthValid, "생년월일은 YYYY.MM.DD 형식이어야 합니다."),
  focuseTimeZone: z.enum(["MORNING", "AFTERNOON", "EVENING", "NIGHT"]),
  dayEndTime: z.string().refine(isDayEndTimeValid, "하루 종료 시간은 HH:MM 형식이어야 합니다."),
  profileImageKey: z.string().optional().refine(isProfileImageKeyValid),
}) satisfies z.ZodType<SignUpFormModel>;

export type SignUpFormErrors = Partial<Record<keyof SignUpFormModel, string>>;

type SignUpFormKey = keyof SignUpFormModel;

const isSignUpFormKey = (value: unknown): value is SignUpFormKey =>
  typeof value === "string" && value in signUpFormSchema.shape;

export const getSignUpFormErrors = (issue: z.ZodError<SignUpFormModel>): SignUpFormErrors => {
  const errors: SignUpFormErrors = {};
  issue.issues.forEach((item) => {
    const key = item.path[0];
    if (!isSignUpFormKey(key) || errors[key]) return;
    errors[key] = item.message;
  });
  return errors;
};

export const validateSignUpField = <Key extends SignUpFormKey>(
  key: Key,
  value: SignUpFormModel[Key],
) => {
  const fieldSchema = signUpFormSchema.shape[key];
  const result = fieldSchema.safeParse(value);
  return result.success ? undefined : result.error.issues[0]?.message;
};
