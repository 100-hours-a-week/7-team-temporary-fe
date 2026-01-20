import { NICKNAME_ALLOWED_CHAR_REGEX } from "./inputRules";

export const getNicknameError = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return "닉네임을 입력해주세요.";
  if (trimmed.length > 10) return "닉네임은 최대 10자까지 입력할 수 있습니다.";
  if (trimmed.includes(" ")) return "닉네임에 공백을 포함할 수 없습니다.";
  if (!NICKNAME_ALLOWED_CHAR_REGEX.test(trimmed)) {
    return "닉네임은 한글 또는 영문자만 입력할 수 있습니다.";
  }
  return undefined;
};

export const isNicknameValid = (value: string) => !getNicknameError(value);
