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
    IMAGE: path("/users/image"),
    CHECK: {
      NICKNAME: (nickname: string) => path(`/users?nickname=${encodeURIComponent(nickname)}`),
      EMAIL: (email: string) => path(`/users/email?email=${encodeURIComponent(email)}`),
    },
    NICKNAME: path("/users/nickname"),
    PASSWORD: path("/users/password"),
  },
  IMAGES: {
    PRESIGNED_URL: path("/images"),
    VIEW: (imageKey: string) => path(`/images/${imageKey}`), // GET
  },
  TERMS: {
    LIST: path("/terms"),
  },
  TERMS_SIGN: {
    LIST: path("/terms-sign"),
    UPDATE: (termsId: number) => path(`/terms-sign/${termsId}`),
  },
  DAY_PLAN: {
    SCHEDULE: path("/day-plan/schedule"),
    SCHEDULE_BY_ID: (dayPlanId: number) => path(`/day-plan/${dayPlanId}/schedule`),
    AI_ARRANGEMENT: (dayPlanId: number) => path(`/day-plan/${dayPlanId}/schedules/ai-arrangement`),
    SCHEDULES_BY_ID: (dayPlanId: number) => path(`/day-plan/${dayPlanId}/schedules`),
  },
  SCHEDULE: {
    BY_ID: (scheduleId: number) => path(`/schedule/${scheduleId}`),
    CHILDREN: path("/schedule/children"),
  },
  FCM: {
    TOKENS: path("/fcm-tokens"),
  },
  NOTIFICATIONS: {
    LIST: path("/notifications"),
  },
} as const;
