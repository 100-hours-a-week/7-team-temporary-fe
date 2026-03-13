/**
 * API 엔드포인트 레지스트리
 *
 * ## 환경 변수
 * - NEXT_PUBLIC_API_TASK_BASE_URL        : task 서비스 base URL (기본값: /api/task)
 * - NEXT_PUBLIC_API_CHAT_BASE_URL        : chat 서비스 base URL (기본값: /api/chat)
 */

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

const taskPath = (endpoint: string): string => `${TASK_API_BASE_URL}${endpoint}`;
const chatPath = (endpoint: string): string => `${CHAT_API_BASE_URL}${endpoint}`;

export const Endpoint = {
  // ─────────────────────────────────────────────────────────────────────────
  // TASK SERVICE  (taskPath 전용)
  // 소유: 인증·사용자·일정·알림 도메인
  // ─────────────────────────────────────────────────────────────────────────

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
    VIEW: (imageKey: string) => taskPath(`/images/${imageKey}`),
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
      taskPath(`/day-plan/${dayPlanId}/schedules/ai-arrangement`),
    SCHEDULES_BY_ID: (dayPlanId: number) => taskPath(`/day-plan/${dayPlanId}/schedules`),
  },

  SCHEDULE: {
    BASE: taskPath("/schedule"),
    BY_ID: (scheduleId: number) => taskPath(`/schedule/${scheduleId}`),
    STATUS: (scheduleId: number) => taskPath(`/schedule/${scheduleId}/status`),
    CHILDREN: taskPath("/schedule/children"),
  },

  FCM: {
    TOKENS: taskPath("/fcm-tokens"),
  },

  NOTIFICATIONS: {
    LIST: taskPath("/notifications"),
  },

  ISSUE: {
    BASE: taskPath("/issue"),
  },

  RETRO: {
    // 인증 필요 (프록시 경유)
    BASE: taskPath("/reflections"),
    UPDATE: (reflectionId: number) => taskPath(`/reflections/${reflectionId}`),
    UPDATE_VISIBILITY: (reflectionId: number) => taskPath(`/reflections/${reflectionId}`),
    DELETE: (reflectionId: number) => taskPath(`/reflections/${reflectionId}`),
    LIKE: (reflectionId: number) => taskPath(`/reflections/${reflectionId}/like`),
    // 비인증 공개 (백엔드 직접)
    PUBLIC_LIST: taskPath("/reflections"),
    BY_ID: (reflectionId: number) => taskPath(`/reflections/${reflectionId}`),
  },

  REPORTS: {
    LIST: taskPath("/reports"),
    MESSAGE: (reportId: number) => taskPath(`/reports/${reportId}/message`),
    MESSAGES: (reportId: number) => taskPath(`/reports/${reportId}/messages`),
  },

  FRIENDS: {
    LIST: taskPath("/friends"),
    DELETE: (friendUserId: number) => taskPath(`/friends/${friendUserId}`),
  },

  FRIEND_REQUESTS: {
    LIST: taskPath("/friend-requests"),
    CREATE: (targetUserId: number) => taskPath(`/friend-requests/${targetUserId}`),
    UPDATE: (requestId: number) => taskPath(`/friend-requests/${requestId}`),
    DELETE: (requestId: number) => taskPath(`/friend-requests/${requestId}`),
  },

  // ─────────────────────────────────────────────────────────────────────────
  // CHAT SERVICE  (chatPath 전용)
  // 소유: 채팅방 도메인
  // ─────────────────────────────────────────────────────────────────────────

  CHAT_ROOMS: {
    CREATE: chatPath("/chat-rooms"),
    DETAIL: (roomId: number) => chatPath(`/chat-rooms/${roomId}`),
    JOIN: (roomId: number) => chatPath(`/chat-rooms/${roomId}/participants`),
    JOIN_BY_FRIEND: (friendId: number) => chatPath(`/chat-rooms/participants/${friendId}`),
    WEBRTC_TOKEN: (roomId: number) => chatPath(`/chat-rooms/${roomId}/webrtc/token`),
    VIDEO_SESSIONS: (roomId: number) => chatPath(`/chat-rooms/${roomId}/video/sessions`),
    UPDATE_CAMERA_STATUS: (participantId: number) =>
      chatPath(`/chat-rooms/participants/${participantId}`),
    LEAVE: (roomId: number, participantId: number) =>
      chatPath(`/chat-rooms/${roomId}/participants/${participantId}`),
    SEND_MESSAGE: (roomId: number) => chatPath(`/chat-rooms/${roomId}/messages`),
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
    OWNER_STATUS: (roomId: number, ownerId: number) =>
      chatPath(`/chat-rooms/${roomId}/owner/${ownerId}`),
    MESSAGES: (roomId: number) => chatPath(`/chat-rooms/${roomId}/message`),
    PARTICIPANT_MESSAGE: (participantId: number) =>
      chatPath(`/chat-rooms/participants/${participantId}/message`),
  },
} as const;
