/**
 * AuthErrorCode (feature/domain)
 * - 사용자 행동 실패의 의미를 표현
 * - UI가 바로 이해할 수 있는 에러
 * - form / toast 분기 기준
 */
export const AUTH_ERROR_CODE = {
  INVALID_PASSWORD: "INVALID_PASSWORD",

  EMAIL_CONFLICT: "EMAIL_CONFLICT",
  NICKNAME_CONFLICT: "NICKNAME_CONFLICT",
  UNKNOWN: "UNKNOWN",
} as const;

export type AuthErrorCode = (typeof AUTH_ERROR_CODE)[keyof typeof AUTH_ERROR_CODE];

/**
 * AuthError (feature/domain)
 * - 기준: 프론트 UX(type)
 * - 목적: UI 분기 처리
 */
export class AuthError extends Error {
  readonly type: AuthErrorCode;

  constructor(type: AuthErrorCode, message: string) {
    super(message);
    this.name = "AuthError";
    this.type = type;
  }
}
