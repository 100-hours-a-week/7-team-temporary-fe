import type { ApiError } from "../error";

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

export class CommonError extends Error {
  readonly type: CommonErrorCode;

  constructor(type: CommonErrorCode, message: string) {
    super(message);
    this.name = "CommonError";
    this.type = type;
  }
}

export function mapCommonError(error: unknown): Error | null {
  if (!(error instanceof Error)) return null;
  const apiError = error as ApiError;
  if (!apiError.code) return null;

  switch (apiError.code) {
    case COMMON_ERROR_CODE.INVALID_REQUEST:
      return new CommonError(COMMON_ERROR_CODE.INVALID_REQUEST, apiError.message);
    case COMMON_ERROR_CODE.UNAUTHORIZED:
      return new CommonError(COMMON_ERROR_CODE.UNAUTHORIZED, apiError.message);
    case COMMON_ERROR_CODE.FORBIDDEN:
      return new CommonError(COMMON_ERROR_CODE.FORBIDDEN, apiError.message);
    case COMMON_ERROR_CODE.NOT_FOUND:
      return new CommonError(COMMON_ERROR_CODE.NOT_FOUND, apiError.message);
    case COMMON_ERROR_CODE.INTERNAL_SERVER_ERROR:
      return new CommonError(COMMON_ERROR_CODE.INTERNAL_SERVER_ERROR, apiError.message);
    case COMMON_ERROR_CODE.NETWORK_ERROR:
      return new CommonError(COMMON_ERROR_CODE.NETWORK_ERROR, apiError.message);
    default:
      return null;
  }
}
