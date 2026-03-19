import "server-only";

import { cookies } from "next/headers";

import { ApiError } from "./error";
import { buildUpstreamRequestHeaders } from "./upstreamHeaders";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface ServerFetchOptions<TBody = unknown> {
  method?: HttpMethod;
  body?: TBody;
  headers?: HeadersInit;
  cache?: RequestCache;
  next?: NextFetchRequestConfig;
}

type ApiResponse<T> = {
  status: "SUCCESS" | "INVALID_REQUEST" | "FAIL" | string;
  code?: string;
  message: string;
  data: T;
};

function getBaseUrl(service: "task" | "chat"): string {
  const url = (
    service === "chat"
      ? (process.env.API_PROXY_CHAT_TARGET ?? process.env.API_PROXY_TASK_TARGET)
      : (process.env.API_PROXY_TASK_TARGET ?? process.env.API_PROXY_TARGET)
  )?.trim();

  if (!url) throw new Error(`API_PROXY_${service.toUpperCase()}_TARGET is not set`);
  return url.replace(/\/$/, "");
}

/** 서버 컴포넌트용 task 서비스 절대 경로 빌더 */
export function serverTaskPath(path: string): string {
  return `${getBaseUrl("task")}${path}`;
}

/** 서버 컴포넌트용 chat 서비스 절대 경로 빌더 */
export function serverChatPath(path: string): string {
  return `${getBaseUrl("chat")}${path}`;
}

/**
 * 서버 컴포넌트 / Server Action 전용 fetch 유틸.
 * - `cookies()`로 쿠키 스토어를 읽어 `buildUpstreamRequestHeaders`에 전달한다.
 * - BFF 프록시와 동일한 정책(허용목록 필터링, accessToken → Authorization Bearer 변환)을 공유한다.
 * - `apiFetch`와 동일한 ApiResponse 래핑/에러 처리를 따른다.
 */
export async function serverFetch<TResponse, TBody = unknown>(
  url: string,
  options: ServerFetchOptions<TBody> = {},
): Promise<TResponse> {
  const { method = "GET", body, headers, cache, next } = options;

  const cookieStore = await cookies();

  // 공유 정책 함수에 넘기기 위해 쿠키 스토어를 Headers 객체로 변환한다.
  const syntheticHeaders = new Headers(headers);
  syntheticHeaders.set("Content-Type", "application/json");

  const allCookies = cookieStore.getAll();
  if (allCookies.length > 0) {
    syntheticHeaders.set("Cookie", allCookies.map((c) => `${c.name}=${c.value}`).join("; "));
  }

  // 상태 변경 요청은 XSRF-TOKEN 쿠키값을 헤더로도 전달한다.
  // Spring Security가 Cookie 헤더를 보고 브라우저 요청으로 간주해 CSRF 체크를 하기 때문이다.
  if (method !== "GET") {
    const xsrfToken = cookieStore.get("XSRF-TOKEN")?.value;
    if (xsrfToken) syntheticHeaders.set("X-XSRF-TOKEN", xsrfToken);
  }

  // BFF 프록시와 동일한 정책(허용목록 필터링, accessToken → Authorization Bearer 변환)을 적용한다.
  const mergedHeaders = buildUpstreamRequestHeaders(syntheticHeaders);

  const res = await fetch(url, {
    method,
    headers: mergedHeaders,
    body: body && method !== "GET" ? JSON.stringify(body) : undefined,
    cache,
    next,
  });

  if (res.status === 204) return undefined as TResponse;

  const text = await res.text();
  let json: ApiResponse<TResponse> | null = null;

  if (text) {
    try {
      json = JSON.parse(text) as ApiResponse<TResponse>;
    } catch {
      // non-JSON response
    }
  }

  if (!res.ok) {
    const fallbackCode = res.status === 401 ? "UNAUTHORIZED" : "HTTP_ERROR";
    throw new ApiError(
      res.status,
      json?.code ?? json?.status ?? fallbackCode,
      json?.message ?? res.statusText,
    );
  }

  if (!text || !json) return undefined as TResponse;

  if (json.status !== "SUCCESS") {
    throw new ApiError(
      res.status,
      json.status ?? "BUSINESS_ERROR",
      json.message ?? "요청에 실패했습니다.",
    );
  }

  return json.data;
}
