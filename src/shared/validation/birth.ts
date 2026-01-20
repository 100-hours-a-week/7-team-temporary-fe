import { BIRTH_DATE_REGEX } from "./inputRules";

export const getBirthError = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return "생년월일을 입력해주세요.";
  if (!BIRTH_DATE_REGEX.test(trimmed)) {
    return "생년월일은 YYYY.MM.DD 형식이어야 합니다.";
  }
  return undefined;
};

export const isBirthValid = (value: string) => !getBirthError(value);
