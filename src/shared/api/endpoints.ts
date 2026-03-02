/**
 * API 엔드포인트 레지스트리
 *
 * ## 환경 변수
 * - NEXT_PUBLIC_API_CHAT_BASE_URL        : chat 서비스 base URL (기본값: /api/chat)
 */

const configuredChatApiBaseUrl = process.env.NEXT_PUBLIC_API_CHAT_BASE_URL?.trim();

const CHAT_API_BASE_URL = (
  configuredChatApiBaseUrl && configuredChatApiBaseUrl.length > 0
    ? configuredChatApiBaseUrl
    : "/api/chat"
).replace(/\/$/, "");

const chatPath = (endpoint: string): string => `${CHAT_API_BASE_URL}${endpoint}`;

export const Endpoint = {
  // ─────────────────────────────────────────────────────────────────────────
  // TASK SERVICE  (chatPath 전용)
  // 소유: 인증·사용자·일정·알림 도메인
  // ─────────────────────────────────────────────────────────────────────────

  TOKEN: {
    BASE: chatPath("/token"),
    REFRESH: chatPath("/token"),
  },

  USER: {
    BASE: chatPath("/users"),
    IMAGE: chatPath("/users/image"),
    CHECK: {
      NICKNAME: (nickname: string) => chatPath(`/users?nickname=${encodeURIComponent(nickname)}`),
      EMAIL: (email: string) => chatPath(`/users/email?email=${encodeURIComponent(email)}`),
    },
    NICKNAME: chatPath("/users/nickname"),
    PASSWORD: chatPath("/users/password"),
  },

  IMAGES: {
    PRESIGNED_URL: chatPath("/images"),
    VIEW: (imageKey: string) => chatPath(`/images/${imageKey}`),
  },

  TERMS: {
    LIST: chatPath("/terms"),
  },

  TERMS_SIGN: {
    LIST: chatPath("/terms-sign"),
    UPDATE: (termsId: number) => chatPath(`/terms-sign/${termsId}`),
  },

  DAY_PLAN: {
    SCHEDULE: chatPath("/day-plan/schedule"),
    PERIOD_SCHEDULES: chatPath("/day-plan/period/schedules"),
    SCHEDULE_BY_ID: (dayPlanId: number) => chatPath(`/day-plan/${dayPlanId}/schedule`),
    REFLECTION: (dayPlanId: number) => chatPath(`/day-plan/${dayPlanId}/reflection`),
    AI_ARRANGEMENT: (dayPlanId: number) =>
      chatPath(`/day-plan/${dayPlanId}/schedules/ai-arrangement`),
    SCHEDULES_BY_ID: (dayPlanId: number) => chatPath(`/day-plan/${dayPlanId}/schedules`),
  },

  SCHEDULE: {
    BASE: chatPath("/schedule"),
    BY_ID: (scheduleId: number) => chatPath(`/schedule/${scheduleId}`),
    CHILDREN: chatPath("/schedule/children"),
  },

  FCM: {
    TOKENS: chatPath("/fcm-tokens"),
  },

  NOTIFICATIONS: {
    LIST: chatPath("/notifications"),
  },

  ISSUE: {
    BASE: chatPath("/issue"),
  },

  RETRO: {
    // 인증 필요 (프록시 경유)
    BASE: chatPath("/reflections"),
    UPDATE: (reflectionId: number) => chatPath(`/reflections/${reflectionId}`),
    UPDATE_VISIBILITY: (reflectionId: number) => chatPath(`/reflections/${reflectionId}`),
    DELETE: (reflectionId: number) => chatPath(`/reflections/${reflectionId}`),
    LIKE: (reflectionId: number) => chatPath(`/reflections/${reflectionId}/like`),
    // 비인증 공개 (백엔드 직접)
    PUBLIC_LIST: chatPath("/reflections"),
    BY_ID: (reflectionId: number) => chatPath(`/reflections/${reflectionId}`),
  },

  FRIENDS: {
    LIST: chatPath("/friends"),
    DELETE: (friendUserId: number) => chatPath(`/friends/${friendUserId}`),
  },

  FRIEND_REQUESTS: {
    LIST: chatPath("/friend-requests"),
    CREATE: (targetUserId: number) => chatPath(`/friend-requests/${targetUserId}`),
    UPDATE: (requestId: number) => chatPath(`/friend-requests/${requestId}`),
    DELETE: (requestId: number) => chatPath(`/friend-requests/${requestId}`),
  },

  // ─────────────────────────────────────────────────────────────────────────
  // CHAT SERVICE  (chatPath 전용)
  // 소유: 채팅방 도메인
  // ─────────────────────────────────────────────────────────────────────────

  CHAT_ROOMS: {
    CREATE: chatPath("/chat-rooms"),
    DETAIL: (roomId: number) => chatPath(`/chat-rooms/${roomId}`),
    UPDATE: (roomId: number) => chatPath(`/chat-rooms/${roomId}`),
    DELETE: (roomId: number) => chatPath(`/chat-rooms/${roomId}`),
    SEARCH: ({ title, page = 1, size = 10 }: { title: string; page?: number; size?: number }) => {
      const searchParams = new URLSearchParams({
        title,
        page: String(page),
        size: String(size),
      });
      return chatPath(`/chat-rooms?${searchParams.toString()}`);
    },
    PARTICIPANTS: chatPath("/chat-rooms/participants"),
    OWNER_STATUS: (ownerId: number) => chatPath(`/chat-rooms/participants/${ownerId}`),
    MESSAGES: (roomId: number) => chatPath(`/chat-rooms/${roomId}/message`),
    PARTICIPANT_MESSAGE: (participantId: number) =>
      chatPath(`/chat-rooms/participants/${participantId}/message`),
  },
} as const;
