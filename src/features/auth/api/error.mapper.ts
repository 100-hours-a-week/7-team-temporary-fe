import type { ApiError } from "@/shared/api";
import { AUTH_ERROR_CODE, AuthError } from "./error";

export function mapAuthError(e: ApiError): AuthError {
  switch (e.status) {
    case AUTH_ERROR_CODE.INVALID_PASSWORD:
      return new AuthError(AUTH_ERROR_CODE.INVALID_PASSWORD, e.message);
    case AUTH_ERROR_CODE.EMAIL_CONFLICT:
      return new AuthError(AUTH_ERROR_CODE.EMAIL_CONFLICT, e.message);
    case AUTH_ERROR_CODE.NICKNAME_CONFLICT:
      return new AuthError(AUTH_ERROR_CODE.NICKNAME_CONFLICT, e.message);
    default:
      return new AuthError(AUTH_ERROR_CODE.UNKNOWN, "회원가입에 실패했습니다.");
  }
}
