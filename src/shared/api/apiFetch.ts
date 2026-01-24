type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface FetchOptions<TBody> {
  method?: HttpMethod;
  body?: TBody;
  headers?: HeadersInit;
  signal?: AbortSignal;
}

type ApiResponse<T> = {
  status: "SUCCESS" | "INVALID_REQUEST" | string;
  message: string;
  data: T;
};

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

  const json = (await res.json()) as ApiResponse<TResponse>;

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  // HTTP 실패
  if (!res.ok) {
    throw new Error(json.message ?? `HTTP ${res.status}`);
  }

  // 비즈니스 실패
  if (json.status !== "SUCCESS") {
    throw new Error(json.message);
  }

  return json.data;
}
