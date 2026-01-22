export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface ApiResponse<TData> {
  data: TData;
  meta?: unknown;
  status?: string;
  message?: string;
}

export interface RequestConfig<TBody> {
  method?: HttpMethod;
  body?: TBody;
  headers?: HeadersInit;
  signal?: AbortSignal;
  token?: string;
}
