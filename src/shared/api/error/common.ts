import type { UiError } from "../error";
import { ApiError } from "../error";

/**
 * 공통 오류 코드 정의
 */
export const COMMON_ERROR_CODE = {
  INVALID_REQUEST: "INVALID_REQUEST",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR",
  NETWORK_ERROR: "NETWORK_ERROR",
} as const;

export type CommonErrorCode = (typeof COMMON_ERROR_CODE)[keyof typeof COMMON_ERROR_CODE];

export class CommonError extends Error implements UiError {
  readonly code: CommonErrorCode;
  readonly expose: boolean;
  readonly userMessage: string;

  constructor(
    code: CommonErrorCode,
    message: string,
    options?: { expose?: boolean; userMessage?: string },
  ) {
    super(message);
    this.name = "CommonError";
    this.code = code;
    this.expose = options?.expose ?? true;
    this.userMessage = options?.userMessage ?? message;
  }
}

export function mapCommonError(error: unknown): CommonError | null {
  if (!(error instanceof ApiError)) return null;
  const apiError = error as ApiError;
  if (!apiError.code) return null;

  switch (apiError.code) {
    case COMMON_ERROR_CODE.UNAUTHORIZED:
      return new CommonError(COMMON_ERROR_CODE.UNAUTHORIZED, apiError.message, { expose: true });

    case COMMON_ERROR_CODE.FORBIDDEN:
      return new CommonError(COMMON_ERROR_CODE.FORBIDDEN, apiError.message, { expose: true });

    case COMMON_ERROR_CODE.NOT_FOUND:
      return new CommonError(COMMON_ERROR_CODE.NOT_FOUND, apiError.message);
    case COMMON_ERROR_CODE.INTERNAL_SERVER_ERROR:
      return new CommonError(COMMON_ERROR_CODE.INTERNAL_SERVER_ERROR, apiError.message, {
        expose: false,
        userMessage: "서버 오류가 발생했습니다.",
      });
    case COMMON_ERROR_CODE.NETWORK_ERROR:
      return new CommonError(COMMON_ERROR_CODE.NETWORK_ERROR, apiError.message, {
        userMessage: "네트워크 오류가 발생했습니다.",
      });

    default:
      return null;
  }
}
