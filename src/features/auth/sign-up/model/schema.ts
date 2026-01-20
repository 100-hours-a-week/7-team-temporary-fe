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

//regex 검증 규칙
//refine 내가 만든 규칙으로 검증하겠다.

import type { SignUpFormModel } from "./types";
import { BIRTH_ERRORS } from "@/shared/validation/birth";
import { EMAIL_ERRORS } from "@/shared/validation/email";
import { PASSWORD_ERRORS } from "@/shared/validation/password";
import { NICKNAME_ERRORS } from "@/shared/validation/nickname";
import { GENDER_ERRORS } from "@/shared/validation/gender";
import { DAY_END_TIME_ERRORS } from "@/shared/validation/dayEndTime";

export const signUpFormSchema = z.object({
  email: z.string().trim().refine(isEmailValid, EMAIL_ERRORS.INVALID_FORMAT),
  password: z.string().refine(isPasswordValid, PASSWORD_ERRORS.INVALID_LENGTH),
  nickname: z.string().refine(isNicknameValid, NICKNAME_ERRORS.ALLOWED_CHARS),
  gender: z.enum(["MALE", "FEMALE"]).refine(isGenderValid, GENDER_ERRORS.REQUIRED),
  birth: z.string().refine(isBirthValid, BIRTH_ERRORS.INVALID_FORMAT),
  focusTimeZone: z.enum(["MORNING", "AFTERNOON", "EVENING", "NIGHT"]),
  dayEndTime: z.string().refine(isDayEndTimeValid, DAY_END_TIME_ERRORS.INVALID_FORMAT),
  profileImageKey: z.string().optional().refine(isProfileImageKeyValid),
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
