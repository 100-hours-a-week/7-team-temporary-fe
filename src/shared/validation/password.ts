import { PASSWORD_ALLOWED_CHAR_REGEX } from "./inputRules";

export const PASSWORD_ERRORS = {
  REQUIRED: "비밀번호를 입력해주세요.",
  INVALID_LENGTH: "비밀번호는 8~20자여야 합니다.",
  CONTAINS_SPACE: "비밀번호에 공백을 포함할 수 없습니다.",
  CONTAINS_KOREAN: "비밀번호에 한글을 포함할 수 없습니다.",
  ALLOWED_CHARS: "비밀번호에 허용되지 않은 문자가 포함되어 있습니다.",
  CONTAINS_UPPERCASE: "비밀번호는 대문자/소문자/숫자/특수문자를 각각 1자 이상 포함해야 합니다.",
} as const;

export const getPasswordError = (value: string) => {
  if (!value) return PASSWORD_ERRORS.REQUIRED;
  if (/[ㄱ-ㅎㅏ-ㅣ가-힣]/.test(value)) {
    return PASSWORD_ERRORS.CONTAINS_KOREAN;
  }
  if (value.includes(" ")) {
    return PASSWORD_ERRORS.CONTAINS_SPACE;
  }
  if (value.length < 8 || value.length > 20) {
    return PASSWORD_ERRORS.INVALID_LENGTH;
  }
  if (!PASSWORD_ALLOWED_CHAR_REGEX.test(value)) {
    return PASSWORD_ERRORS.ALLOWED_CHARS;
  }
  const hasUppercase = /[A-Z]/.test(value);
  const hasLowercase = /[a-z]/.test(value);
  const hasNumber = /[0-9]/.test(value);
  const hasSpecial = /[^A-Za-z0-9]/.test(value);
  if (!hasUppercase || !hasLowercase || !hasNumber || !hasSpecial) {
    return PASSWORD_ERRORS.CONTAINS_UPPERCASE;
  }

  return undefined;
};

export const isPasswordValid = (value: string) => !getPasswordError(value);
