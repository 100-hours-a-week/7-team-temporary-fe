import "server-only";

import { cookies } from "next/headers";

import { ApiError } from "./error";

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
 * 서버 컴포넌트 전용 fetch 유틸.
 * - `cookies()`로 accessToken을 읽어 Authorization 헤더를 세팅한다.
 * - server-to-server 호출이므로 CSRF 불필요.
 * - `apiFetch`와 동일한 ApiResponse 래핑/에러 처리를 따른다.
 */
export async function serverFetch<TResponse, TBody = unknown>(
  url: string,
  options: ServerFetchOptions<TBody> = {},
): Promise<TResponse> {
  const { method = "GET", body, headers, cache, next } = options;

  const cookieStore = await cookies();

  const mergedHeaders = new Headers(headers);
  mergedHeaders.set("Content-Type", "application/json");

  // BFF 프록시와 동일하게 Cookie 헤더를 백엔드에 전달한다.
  const allCookies = cookieStore.getAll();
  if (allCookies.length > 0) {
    mergedHeaders.set("Cookie", allCookies.map((c) => `${c.name}=${c.value}`).join("; "));
  }

  // 상태 변경 요청은 XSRF-TOKEN 쿠키값을 헤더로도 전달한다.
  // Spring Security가 Cookie 헤더를 보고 브라우저 요청으로 간주해 CSRF 체크를 하기 때문이다.
  if (method !== "GET") {
    const xsrfToken = cookieStore.get("XSRF-TOKEN")?.value;
    if (xsrfToken) mergedHeaders.set("X-XSRF-TOKEN", xsrfToken);
  }

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
