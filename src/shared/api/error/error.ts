/**
 * - HTTP status 보존
 * - 서버 에러 코드 보존
 * - 아직 도메인 의미를 갖지 않음
 */
export class ApiError extends Error {
  readonly httpStatus: number;
  readonly status: string;

  constructor(httpStatus: number, status: string, message: string) {
    super(message);
    this.name = "ApiError";
    this.httpStatus = httpStatus;
    this.status = status;
  }
}
