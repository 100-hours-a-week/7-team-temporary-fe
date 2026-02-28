/**
 * API 엔드포인트 레지스트리
 *
 * ## 서비스 경계 원칙
 * - 각 그룹은 단일 백엔드 서비스(task 또는 chat)에만 속한다.
 * - 동일 그룹 내에서 taskPath/chatPath를 혼용하지 않는다.
 * - 신규 엔드포인트 추가 시 아래 섹션 구분(TASK SERVICE / CHAT SERVICE)을 기준으로 배치한다.
 *
 * ## 환경 변수
 * - NEXT_PUBLIC_API_TASK_BASE_URL        : task 서비스 base URL, 프록시 경유 (기본값: /api/task)
 * - NEXT_PUBLIC_API_TASK_PUBLIC_BASE_URL : 비인증 공개 API 전용 base URL, 백엔드 직접 접근
 *                                          미설정 시 NEXT_PUBLIC_API_TASK_BASE_URL 값을 사용
 * - NEXT_PUBLIC_API_CHAT_BASE_URL        : chat 서비스 base URL (기본값: /api/chat)
 */

const configuredTaskApiBaseUrl = process.env.NEXT_PUBLIC_API_TASK_BASE_URL?.trim();
const configuredTaskPublicApiBaseUrl = process.env.NEXT_PUBLIC_API_TASK_PUBLIC_BASE_URL?.trim();
const configuredChatApiBaseUrl = process.env.NEXT_PUBLIC_API_CHAT_BASE_URL?.trim();

const TASK_API_BASE_URL = (
  configuredTaskApiBaseUrl && configuredTaskApiBaseUrl.length > 0
    ? configuredTaskApiBaseUrl
    : "/api/task"
).replace(/\/$/, "");

// 비인증 공개 API: 프록시 불필요, 백엔드 직접 접근 가능
// 우선순위: NEXT_PUBLIC_API_TASK_PUBLIC_BASE_URL → API_PROXY_TASK_TARGET(서버 전용) → TASK_API_BASE_URL
const PUBLIC_TASK_API_BASE_URL = (
  configuredTaskPublicApiBaseUrl && configuredTaskPublicApiBaseUrl.length > 0
    ? configuredTaskPublicApiBaseUrl
    : process.env.API_PROXY_TASK_TARGET?.trim() ||
      process.env.API_PROXY_TARGET?.trim() ||
      TASK_API_BASE_URL
).replace(/\/$/, "");

const CHAT_API_BASE_URL = (
  configuredChatApiBaseUrl && configuredChatApiBaseUrl.length > 0
    ? configuredChatApiBaseUrl
    : "/api/chat"
).replace(/\/$/, "");

const taskPath = (endpoint: string): string => `${TASK_API_BASE_URL}${endpoint}`;
const publicTaskPath = (endpoint: string): string => `${PUBLIC_TASK_API_BASE_URL}${endpoint}`;
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
    PUBLIC_LIST: publicTaskPath("/reflections"),
    BY_ID: (reflectionId: number) => publicTaskPath(`/reflections/${reflectionId}`),
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
    PARTICIPANTS: chatPath("/chat-rooms/participants"),
    OWNER_STATUS: (ownerId: number) => chatPath(`/chat-rooms/participants/${ownerId}`),
    MESSAGES: (roomId: number) => chatPath(`/chat-rooms/${roomId}/message`),
    PARTICIPANT_MESSAGE: (participantId: number) =>
      chatPath(`/chat-rooms/participants/${participantId}/message`),
  },
} as const;
