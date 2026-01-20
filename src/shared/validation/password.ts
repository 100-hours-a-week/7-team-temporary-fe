import { PASSWORD_ALLOWED_CHAR_REGEX } from "./inputRules";

export const getPasswordError = (value: string) => {
  if (!value) return "비밀번호를 입력해주세요.";
  if (value.length < 8 || value.length > 20) {
    return "비밀번호는 8~20자여야 합니다.";
  }
  if (value.includes(" ")) return "비밀번호에 공백을 포함할 수 없습니다.";
  if (!PASSWORD_ALLOWED_CHAR_REGEX.test(value)) {
    return "비밀번호에 허용되지 않은 문자가 포함되어 있습니다.";
  }
  if (
    !/[A-Z]/.test(value) ||
    !/[a-z]/.test(value) ||
    !/[0-9]/.test(value) ||
    !/[!@#$%^&*()_+\-={}\[\];':"\\|,.<>/?]/.test(value)
  ) {
    return "비밀번호는 대문자/소문자/숫자를 각각 1자 이상 포함해야 합니다.";
  }

  return undefined;
};

export const isPasswordValid = (value: string) => !getPasswordError(value);
