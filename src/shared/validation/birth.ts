import { BIRTH_DATE_REGEX } from "./inputRules";

export const BIRTH_ERRORS = {
  REQUIRED: "생년월일을 입력해주세요.",
  INVALID_FORMAT: "생년월일은 YYYY.MM.DD 형식이어야 합니다.",
} as const;

export const getBirthError = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return BIRTH_ERRORS.REQUIRED;
  if (!BIRTH_DATE_REGEX.test(trimmed)) {
    return BIRTH_ERRORS.INVALID_FORMAT;
  }
  return undefined;
};

export const isBirthValid = (value: string) => !getBirthError(value);
