const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

export const path = (endpoint: string) => `${API_BASE_URL}${endpoint}`;

export const Endpoint = {} as const;

export { API_BASE_URL };
