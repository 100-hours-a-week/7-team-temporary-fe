import { EMAIL_ALLOWED_CHAR_REGEX } from "./inputRules";

export const getEmailError = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return "이메일을 입력해주세요.";
  if (!EMAIL_ALLOWED_CHAR_REGEX.test(trimmed)) {
    return "이메일에 허용되지 않은 문자가 포함되어 있습니다.";
  }
  if (trimmed.includes(" ")) return "이메일에 공백을 포함할 수 없습니다.";
  const parts = trimmed.split("@");
  if (parts.length !== 2) return "이메일 형식이 올바르지 않습니다.";
  const [localPart, domainPart] = parts;
  if (!localPart || !domainPart) return "이메일 형식이 올바르지 않습니다.";
  if (!domainPart.includes(".")) return "이메일 형식이 올바르지 않습니다.";
  if (domainPart.startsWith(".") || domainPart.endsWith(".")) {
    return "이메일 형식이 올바르지 않습니다.";
  }
  return undefined;
};

export const isEmailValid = (value: string) => !getEmailError(value);
