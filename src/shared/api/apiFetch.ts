import { ApiError } from "./error";
import { AuthService } from "@/shared/auth";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface FetchOptions<TBody> {
  method?: HttpMethod;
  body?: TBody;
  headers?: HeadersInit;
  signal?: AbortSignal;
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
): Promise<TResponse> {
  const { method = "GET", body, headers, signal } = options;

  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: body && method !== "GET" ? JSON.stringify(body) : undefined,
    signal,
  });

  if (res.status === 204) {
    return undefined as TResponse;
  }

  const text = await res.text();
  const json = text ? (JSON.parse(text) as ApiResponse<TResponse>) : null;
  console.log(json);

  // HTTP 실패
  if (!res.ok) {
    throw new ApiError(
      res.status,
      json?.code ?? json?.status ?? "HTTP_ERROR",
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
