import { ApiError } from "./error";

export function getXsrfToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface FetchOptions<TBody> {
  method?: HttpMethod;
  body?: TBody;
  headers?: HeadersInit;
  signal?: AbortSignal;
  authRequired?: boolean;
  credentials?: RequestCredentials;
}

type ApiResponse<T> = {
  status: "SUCCESS" | "INVALID_REQUEST" | "FAIL" | string;
  code?: string;
  message: string;
  data: T;
};
/**
 * API 요청/응답 공통 유틸 모듈
 * - JSON 요청 전송
 * - 실패 응답 : HTTP/비즈니스 에러 객체 throw
 * - 성공 응답 : data 데이터 반환
 */
export async function apiFetch<TResponse, TBody = unknown>(
  url: string,
  options: FetchOptions<TBody> = {},
  _csrfRetry = true,
): Promise<TResponse> {
  const { method = "GET", body, headers, signal, authRequired } = options;
  const { credentials } = options;
  const resolvedCredentials = authRequired && !credentials ? "include" : credentials;

  const mergedHeaders = new Headers(headers);
  if (!mergedHeaders.has("Content-Type")) {
    mergedHeaders.set("Content-Type", "application/json");
  }

  if (method !== "GET" && !mergedHeaders.has("X-XSRF-TOKEN")) {
    const xsrfToken = getXsrfToken();
    if (xsrfToken) mergedHeaders.set("X-XSRF-TOKEN", xsrfToken);
  }

  const res = await fetch(url, {
    method,
    headers: mergedHeaders,
    body: body && method !== "GET" ? JSON.stringify(body) : undefined,
    signal,
    credentials: resolvedCredentials,
  });

  if (res.status === 204) {
    return undefined as TResponse;
  }

  // 403 + non-GET: 서버가 새 XSRF-TOKEN을 발급했을 수 있으므로 한 번만 retry
  if (res.status === 403 && method !== "GET" && _csrfRetry) {
    const newToken = getXsrfToken();
    if (newToken) {
      return apiFetch(url, options, false);
    }
  }

  const text = await res.text();
  let json: ApiResponse<TResponse> | null = null;
  if (text) {
    try {
      json = JSON.parse(text) as ApiResponse<TResponse>;
    } catch (error) {
      console.warn("[apiFetch] failed to parse JSON response", { url, status: res.status, error });
    }
  }

  // HTTP 실패
  if (!res.ok) {
    const fallbackCode = res.status === 401 ? "UNAUTHORIZED" : "HTTP_ERROR";
    throw new ApiError(
      res.status,
      json?.code ?? json?.status ?? fallbackCode,
      json?.message ?? res.statusText,
    );
  }

  if (!text) {
    return undefined as TResponse;
  }

  if (!json) {
    return undefined as TResponse;
  }

  // 비즈니스 실패 (HTTP 200이지만 status FAIL)
  if (json.status != "SUCCESS") {
    throw new ApiError(
      res.status,
      json.status ?? "BUSINESS_ERROR",
      json.message ?? "요청에 실패했습니다.",
    );
  }

  return json.data;
}
