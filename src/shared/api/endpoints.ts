const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

/**
 * base url + endpoint path 결합 유틸
 */
const path = (endpoint: string): string => `${API_BASE_URL}${endpoint}`;

export const Endpoint = {
  TOKEN: {
    BASE: path("/token"),
    REFRESH: path("/token"),
  },
  USER: {
    BASE: path("/users"),
    CHECK: {
      NICKNAME: (nickname: string) => path(`/users?nickname=${encodeURIComponent(nickname)}`),

      EMAIL: (email: string) => path(`/users?email=${encodeURIComponent(email)}`),
    },
    NICKNAME: path("/users/nickname"),
    PASSWORD: path("/users/password"),
  },
  UPLOAD: {
    PRESIGNED_URL: path("/images"),
    UPLOAD: (imageKey: string) => path(`/images/${imageKey}`),
  },
} as const;
