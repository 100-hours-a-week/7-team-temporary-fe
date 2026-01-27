import { EMAIL_ALLOWED_CHAR_REGEX } from "./inputRules";

export const EMAIL_ERRORS = {
  REQUIRED: "이메일을 입력해주세요.",
  INVALID_FORMAT: "이메일 형식이 올바르지 않습니다.",
  CONTAINS_SPACE: "이메일에 공백을 포함할 수 없습니다.",
  ALLOWED_CHARS: "이메일에 허용되지 않은 문자가 포함되어 있습니다.",
} as const;

export const getEmailError = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return EMAIL_ERRORS.REQUIRED;
  if (!EMAIL_ALLOWED_CHAR_REGEX.test(trimmed)) {
    return EMAIL_ERRORS.ALLOWED_CHARS;
  }
  if (trimmed.includes(" ")) return EMAIL_ERRORS.CONTAINS_SPACE;
  const parts = trimmed.split("@");
  if (parts.length !== 2) return EMAIL_ERRORS.INVALID_FORMAT;
  const [localPart, domainPart] = parts;
  if (!localPart || !domainPart) return EMAIL_ERRORS.INVALID_FORMAT;
  if (!domainPart.includes(".")) return EMAIL_ERRORS.INVALID_FORMAT;
  if (domainPart.startsWith(".") || domainPart.endsWith(".")) {
    return EMAIL_ERRORS.INVALID_FORMAT;
  }
  return undefined;
};

//동일한 규칙을 다른곳에서도 재사용가능
export const isEmailValid = (value: string) => !getEmailError(value);
