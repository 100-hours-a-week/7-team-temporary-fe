/**
 * ApiError (shared/infra)
 * - 기준: 서버 스펙(HTTP status, code, data)
 * - 목적: 실패 원인 전달
 */
export class ApiError<TData = unknown> extends Error {
  constructor(
    public httpStatus: number,
    public code: string,
    message: string,
    public data?: TData,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * UiError (shared/infra)
 * - 기준: 프론트 UX(type)
 * - 목적: UI 분기 처리
 */
export interface UiError {
  readonly code: string;
  readonly expose: boolean;
  readonly userMessage: string;
}
