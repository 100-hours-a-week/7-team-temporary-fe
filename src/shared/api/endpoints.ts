const configuredTaskApiBaseUrl = process.env.NEXT_PUBLIC_API_TASK_BASE_URL?.trim();
const configuredChatApiBaseUrl = process.env.NEXT_PUBLIC_API_CHAT_BASE_URL?.trim();

const TASK_API_BASE_URL = (
  configuredTaskApiBaseUrl && configuredTaskApiBaseUrl.length > 0
    ? configuredTaskApiBaseUrl
    : "/api/task"
).replace(/\/$/, "");

const CHAT_API_BASE_URL = (
  configuredChatApiBaseUrl && configuredChatApiBaseUrl.length > 0
    ? configuredChatApiBaseUrl
    : "/api/chat"
).replace(/\/$/, "");

/**
 * task base url + endpoint path 결합 유틸
 */
const taskPath = (endpoint: string): string => `${TASK_API_BASE_URL}${endpoint}`;
const chatPath = (endpoint: string): string => `${CHAT_API_BASE_URL}${endpoint}`;

export const Endpoint = {
  TOKEN: {
    BASE: taskPath("/token"),
    REFRESH: taskPath("/token"),
  },
  USER: {
    BASE: taskPath("/users"),
    IMAGE: taskPath("/users/image"),
    CHECK: {
      NICKNAME: (nickname: string) => taskPath(`/users?nickname=${encodeURIComponent(nickname)}`),
      EMAIL: (email: string) => taskPath(`/users/email?email=${encodeURIComponent(email)}`),
    },
    NICKNAME: taskPath("/users/nickname"),
    PASSWORD: taskPath("/users/password"),
  },
  IMAGES: {
    PRESIGNED_URL: taskPath("/images"),
    VIEW: (imageKey: string) => taskPath(`/images/${imageKey}`), // GET
  },
  TERMS: {
    LIST: taskPath("/terms"),
  },
  TERMS_SIGN: {
    LIST: taskPath("/terms-sign"),
    UPDATE: (termsId: number) => taskPath(`/terms-sign/${termsId}`),
  },
  DAY_PLAN: {
    SCHEDULE: taskPath("/day-plan/schedule"),
    PERIOD_SCHEDULES: taskPath("/day-plan/period/schedules"),
    SCHEDULE_BY_ID: (dayPlanId: number) => taskPath(`/day-plan/${dayPlanId}/schedule`),
    REFLECTION: (dayPlanId: number) => taskPath(`/day-plan/${dayPlanId}/reflection`),
    AI_ARRANGEMENT: (dayPlanId: number) =>
      chatPath(`/day-plan/${dayPlanId}/schedules/ai-arrangement`),
    SCHEDULES_BY_ID: (dayPlanId: number) => taskPath(`/day-plan/${dayPlanId}/schedules`),
  },
  SCHEDULE: {
    BASE: taskPath("/schedule"),
    BY_ID: (scheduleId: number) => taskPath(`/schedule/${scheduleId}`),
    CHILDREN: taskPath("/schedule/children"),
  },
  FCM: {
    TOKENS: taskPath("/fcm-tokens"),
  },
  NOTIFICATIONS: {
    LIST: taskPath("/notifications"),
  },
  FRIENDS: {
    LIST: chatPath("/friends"),
    DELETE: (friendUserId: number) => chatPath(`/friends/${friendUserId}`),
  },
  FRIEND_REQUESTS: {
    LIST: chatPath("/friend-requests"),
    CREATE: (targetUserId: number) => chatPath(`/friend-requests/${targetUserId}`),
    DELETE: (requestId: number) => chatPath(`/friend-requests/${requestId}`),
  },
  ISSUE: {
    BASE: taskPath("/issue"),
  },
  RETRO: {
    BASE: chatPath("/reflections"),
    LIKES: (reflectionId: number) => chatPath(`/reflections/${reflectionId}/likes`),
  },
  CHAT_ROOMS: {
    PARTICIPANTS: chatPath("/chat-rooms/participants"),
    OWNER_STATUS: (ownerId: number) => chatPath(`/chat-rooms/participants/${ownerId}`),
    MESSAGES: (roomId: number) => chatPath(`/chat-rooms/${roomId}/message`),
    PARTICIPANT_MESSAGE: (participantId: number) =>
      chatPath(`/chat-rooms/participants/${participantId}/message`),
  },
} as const;
