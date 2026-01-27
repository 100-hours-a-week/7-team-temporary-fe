import { NICKNAME_ALLOWED_CHAR_REGEX } from "./inputRules";

export const NICKNAME_ERRORS = {
  REQUIRED: "닉네임을 입력해주세요.",
  MAX_LENGTH: "닉네임은 최대 10자까지 입력할 수 있습니다.",
  CONTAINS_SPACE: "닉네임에 공백을 포함할 수 없습니다.",
  ALLOWED_CHARS: "닉네임은 한글 또는 영문자만 입력할 수 있습니다.",
} as const;

export const getNicknameError = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return NICKNAME_ERRORS.REQUIRED;
  if (trimmed.length > 10) return NICKNAME_ERRORS.MAX_LENGTH;
  if (trimmed.includes(" ")) return NICKNAME_ERRORS.CONTAINS_SPACE;
  if (!NICKNAME_ALLOWED_CHAR_REGEX.test(trimmed)) {
    return NICKNAME_ERRORS.ALLOWED_CHARS;
  }
  return undefined;
};

export const isNicknameValid = (value: string) => !getNicknameError(value);
