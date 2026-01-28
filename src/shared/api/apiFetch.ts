import { ApiError } from "./error";
import { useAuthStore } from "@/shared/auth";

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
): Promise<TResponse> {
  const { method = "GET", body, headers, signal, authRequired } = options;
  const { credentials } = options;
  const resolvedCredentials = authRequired && !credentials ? "include" : credentials;

  const mergedHeaders: HeadersInit = {
    "Content-Type": "application/json",
    ...headers,
  };

  //AToken 존재 시 Authorization 헤더 추가
  if (authRequired) {
    const accessToken = useAuthStore.getState().accessToken;
    if (accessToken && !("Authorization" in (mergedHeaders as Record<string, string>))) {
      (mergedHeaders as Record<string, string>).Authorization = `Bearer ${accessToken}`;
    }
    console.log("[apiFetch] authRequired request", {
      url,
      hasAccessToken: Boolean(accessToken),
      accessTokenPreview: accessToken ? `${accessToken.slice(0, 8)}...` : null,
    });
  }

  const res = await fetch(url, {
    method,
    headers: mergedHeaders,
    body: body && method !== "GET" ? JSON.stringify(body) : undefined,
    signal,
    credentials: resolvedCredentials,
  });

  console.log("[apiFetch] response received", res, { url, status: res.status });

  if (res.status === 204) {
    return undefined as TResponse;
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
  console.log(json);

  // HTTP 실패
  if (!res.ok) {
    if (res.status === 401) {
      useAuthStore.getState().clearAuth();
      if (typeof window !== "undefined") {
        const { pathname } = window.location;
        if (pathname !== "/login") {
          window.location.assign("/login");
        }
      }
    }
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
