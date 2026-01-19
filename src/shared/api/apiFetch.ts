import { ApiError } from "./error";

import type { ApiResponse, HttpMethod, RequestConfig } from "./types";

const DEFAULT_METHOD: HttpMethod = "GET";
const CONTENT_TYPE_JSON = "application/json";

// 공통 에러 메시지 파싱: 서버 메시지가 없으면 statusText를 사용한다.
function getErrorMessage(payload: unknown, fallback: string) {
  if (payload && typeof payload === "object" && "message" in payload) {
    const message = payload.message;
    if (typeof message === "string") return message;
  }
  return fallback;
}

//TResponse : 최종적으로 호출자가 받게 될 데이터 타입
//TBody : request body 타입 (기본 unknown)

// Transport Layer: HTTP I/O만 담당하며, 성공 시 데이터만 반환한다.
export async function apiFetch<TResponse, TBody = unknown>(
  url: string,
  config: RequestConfig<TBody> = {},
): Promise<TResponse> {
  const { method = DEFAULT_METHOD, body, headers, signal, token } = config;
  const hasBody = body !== undefined && method !== "GET";

  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": CONTENT_TYPE_JSON,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    ...(hasBody ? { body: JSON.stringify(body) } : {}),
    signal,
  });

  // JSON 응답 여부를 확인해 파싱 방식을 결정한다.
  const contentType = res.headers.get("Content-Type") ?? "";
  const isJson = contentType.includes("application/json");

  // HTTP 오류는 ApiError로 통일해서 throw한다.
  if (!res.ok) {
    const payload = isJson ? await res.json().catch(() => undefined) : undefined;
    const message = getErrorMessage(payload, res.statusText);
    throw new ApiError(res.status, message);
  }

  // JSON이 아닌 응답은 데이터 없이 종료한다.
  if (!isJson) {
    return undefined as TResponse;
  }

  // API 표준 응답( data 래핑 )과 원시 응답을 모두 지원한다.
  const data = (await res.json()) as ApiResponse<TResponse> | TResponse;
  if (data && typeof data === "object" && "data" in data) {
    return (data as ApiResponse<TResponse>).data;
  }
  return data as TResponse;
}
