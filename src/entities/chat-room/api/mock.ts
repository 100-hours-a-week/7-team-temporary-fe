import type {
  ChatMessageDto,
  ChatMessageListResponseDto,
  ChatRoomSummaryDto,
  ChatRoomListResponseDto,
  ChatRoomType,
  ChatRoomOwnerStatusDto,
} from "./types";

const OPEN_CHAT_MOCK_ITEMS: ChatRoomSummaryDto[] = [
  {
    roomId: 10,
    type: "OPEN_CHAT",
    title: "삼전 적정가는 18만이다.",
    description: "삼전이 18만원이 적정가인가에 대한 토론방",
    maxParticipants: 10,
    participantsCount: 2,
  },
  {
    roomId: 11,
    type: "OPEN_CHAT",
    title: "삼전 18만 근거 자료 공유",
    description: "자료 공유방",
    maxParticipants: 50,
    participantsCount: 12,
  },
  {
    roomId: 12,
    type: "OPEN_CHAT",
    title: "100시간 프로젝트 일정 조율",
    description: "팀 일정을 조율하는 방",
    maxParticipants: 20,
    participantsCount: 7,
  },
  {
    roomId: 13,
    type: "OPEN_CHAT",
    title: "프론트엔드 코드리뷰 모임",
    description: "코드리뷰 규칙과 사례를 공유하는 방",
    maxParticipants: 30,
    participantsCount: 18,
  },
  {
    roomId: 14,
    type: "OPEN_CHAT",
    title: "백엔드 API 계약 협의",
    description: "API 스펙 변경사항을 협의하는 방",
    maxParticipants: 25,
    participantsCount: 9,
  },
  {
    roomId: 15,
    type: "OPEN_CHAT",
    title: "면접 스터디 질문 아카이브",
    description: "면접 질문과 답변을 정리하는 방",
    maxParticipants: 40,
    participantsCount: 22,
  },
  {
    roomId: 16,
    type: "OPEN_CHAT",
    title: "데이터 분석 입문 스터디",
    description: "SQL과 지표 해석을 연습하는 방",
    maxParticipants: 18,
    participantsCount: 11,
  },
  {
    roomId: 17,
    type: "OPEN_CHAT",
    title: "취업 포트폴리오 피드백",
    description: "포트폴리오 상호 피드백 채팅방",
    maxParticipants: 20,
    participantsCount: 14,
  },
  {
    roomId: 18,
    type: "OPEN_CHAT",
    title: "알고리즘 문제 풀이 데일리",
    description: "매일 1문제 풀이 인증 방",
    maxParticipants: 50,
    participantsCount: 31,
  },
  {
    roomId: 19,
    type: "OPEN_CHAT",
    title: "디자인 시스템 구축 논의",
    description: "토큰/컴포넌트 구조를 논의하는 방",
    maxParticipants: 16,
    participantsCount: 10,
  },
  {
    roomId: 22,
    type: "OPEN_CHAT",
    title: "커리어 멘토링 Q&A",
    description: "주니어 커리어 고민 상담 방",
    maxParticipants: 35,
    participantsCount: 17,
  },
  {
    roomId: 23,
    type: "OPEN_CHAT",
    title: "이력서 첨삭 클리닉",
    description: "이력서/자소서 첨삭 공유 방",
    maxParticipants: 24,
    participantsCount: 8,
  },
  {
    roomId: 24,
    type: "OPEN_CHAT",
    title: "모의 코딩테스트 실전반",
    description: "실전 코테 시간 맞춰 푸는 방",
    maxParticipants: 60,
    participantsCount: 27,
  },
  {
    roomId: 25,
    type: "OPEN_CHAT",
    title: "CS 스터디 핵심 개념",
    description: "운영체제/네트워크 핵심 정리 방",
    maxParticipants: 45,
    participantsCount: 20,
  },
];

const CAM_STUDY_MOCK_ITEMS: ChatRoomSummaryDto[] = [
  {
    roomId: 20,
    type: "CAM_STUDY",
    title: "오전 캠 스터디",
    description: "오전 9시~12시 집중 스터디",
    maxParticipants: 6,
    participantsCount: 4,
  },
  {
    roomId: 21,
    type: "CAM_STUDY",
    title: "저녁 캠 스터디",
    description: "저녁 8시~11시 집중 스터디",
    maxParticipants: 6,
    participantsCount: 3,
  },
];

// ─── Mock Realtime State (WebSocket 미연결 시 UI 확인용) ─────────────────────

/** true로 켜두면 mapper가 아래 상태를 병합해 lastMessage/unreadCount를 렌더링한다 */
export const CHAT_ROOM_REALTIME_MOCK_ENABLED = true;

export interface MockRealtimeEntry {
  lastMessage: string;
  lastMessageAt: string; // ISO date string
  unreadCount: number;
}

export const MOCK_REALTIME_STATE: Record<number, MockRealtimeEntry> = {
  10: {
    lastMessage: "삼전 18만이 맞다고 봅니다",
    lastMessageAt: "2026-02-24T09:30:00+09:00",
    unreadCount: 3,
  },
  11: {
    lastMessage: "자료 올려드렸어요!",
    lastMessageAt: "2026-02-24T11:15:00+09:00",
    unreadCount: 0,
  },
  12: {
    lastMessage: "일정 확인해주세요~",
    lastMessageAt: "2026-02-23T20:00:00+09:00",
    unreadCount: 1,
  },
  13: {
    lastMessage: "코드리뷰 코멘트 남겼어요.",
    lastMessageAt: "2026-02-24T10:05:00+09:00",
    unreadCount: 4,
  },
  14: {
    lastMessage: "API 스키마 v2 공유합니다.",
    lastMessageAt: "2026-02-24T10:20:00+09:00",
    unreadCount: 0,
  },
  15: {
    lastMessage: "오늘 면접 질문 3개 정리 완료!",
    lastMessageAt: "2026-02-24T09:48:00+09:00",
    unreadCount: 2,
  },
  16: {
    lastMessage: "SQL JOIN 문제 같이 풀어봐요.",
    lastMessageAt: "2026-02-24T09:12:00+09:00",
    unreadCount: 1,
  },
  17: {
    lastMessage: "포폴 피드백 드렸습니다.",
    lastMessageAt: "2026-02-24T08:40:00+09:00",
    unreadCount: 0,
  },
  18: {
    lastMessage: "오늘 문제 난이도 꽤 높네요.",
    lastMessageAt: "2026-02-24T11:02:00+09:00",
    unreadCount: 5,
  },
  19: {
    lastMessage: "토큰 네이밍 룰 확정할까요?",
    lastMessageAt: "2026-02-24T10:58:00+09:00",
    unreadCount: 3,
  },
  22: {
    lastMessage: "신입 지원 전략 공유합니다.",
    lastMessageAt: "2026-02-24T09:55:00+09:00",
    unreadCount: 1,
  },
  23: {
    lastMessage: "이력서 2차 첨삭 반영했어요.",
    lastMessageAt: "2026-02-24T10:42:00+09:00",
    unreadCount: 0,
  },
  24: {
    lastMessage: "모의 코테 1회차 시작합니다!",
    lastMessageAt: "2026-02-24T11:11:00+09:00",
    unreadCount: 6,
  },
  25: {
    lastMessage: "운영체제 요약본 업로드 완료.",
    lastMessageAt: "2026-02-24T08:15:00+09:00",
    unreadCount: 2,
  },
  20: {
    lastMessage: "오늘도 열심히 달려봅시다!",
    lastMessageAt: "2026-02-24T08:55:00+09:00",
    unreadCount: 0,
  },
  21: {
    lastMessage: "저녁 스터디 시작합니다",
    lastMessageAt: "2026-02-23T20:05:00+09:00",
    unreadCount: 2,
  },
};

export const CHAT_ROOM_WEBSOCKET_MOCK_ENABLED = true;
export const CHAT_ROOM_MESSAGE_LIST_MOCK_ENABLED =
  process.env.NEXT_PUBLIC_CHAT_ROOM_MESSAGE_LIST_MOCK === "true";

export interface MockRealtimeMessage extends MockRealtimeEntry {
  roomId: number;
}

const MOCK_WEBSOCKET_MESSAGES = [
  "새 메시지가 도착했어요.",
  "자료 링크 올려둘게요!",
  "좋은 의견 감사합니다.",
  "지금 바로 확인 가능해요.",
  "다음 일정 공지드립니다.",
  "이 스레드로 계속 이야기해요.",
];

let runtimeRealtimeState: Record<number, MockRealtimeEntry> = { ...MOCK_REALTIME_STATE };

function pickRandomMessage() {
  return MOCK_WEBSOCKET_MESSAGES[Math.floor(Math.random() * MOCK_WEBSOCKET_MESSAGES.length)];
}

function pickTargetRoomId(roomIds?: number[]) {
  const candidates = (
    roomIds?.length ? roomIds : OPEN_CHAT_MOCK_ITEMS.map((item) => item.roomId)
  ).filter((roomId) => OPEN_CHAT_MOCK_ITEMS.some((item) => item.roomId === roomId));
  if (candidates.length === 0) return null;
  return candidates[Math.floor(Math.random() * candidates.length)];
}

export function getMockRealtimeStateSnapshot(roomIds?: number[]) {
  if (!roomIds?.length) return { ...runtimeRealtimeState };

  const picked: Record<number, MockRealtimeEntry> = {};
  roomIds.forEach((roomId) => {
    const state = runtimeRealtimeState[roomId];
    if (state) picked[roomId] = state;
  });
  return picked;
}

interface SubscribeMockChatRoomRealtimeOptions {
  enabled?: boolean;
  intervalMs?: number;
  roomIds?: number[];
}

export function subscribeMockChatRoomRealtime(
  onMessage: (message: MockRealtimeMessage) => void,
  {
    enabled = CHAT_ROOM_WEBSOCKET_MOCK_ENABLED,
    intervalMs = 3000,
    roomIds,
  }: SubscribeMockChatRoomRealtimeOptions = {},
) {
  if (!enabled) {
    return () => undefined;
  }

  const timer = setInterval(() => {
    const roomId = pickTargetRoomId(roomIds);
    if (roomId === null) return;

    const prev = runtimeRealtimeState[roomId] ?? {
      lastMessage: pickRandomMessage(),
      lastMessageAt: new Date().toISOString(),
      unreadCount: 0,
    };

    const nextUnreadCount = Math.min(99, prev.unreadCount + Math.floor(Math.random() * 3 + 1));
    const next: MockRealtimeEntry = {
      lastMessage: pickRandomMessage(),
      lastMessageAt: new Date().toISOString(),
      unreadCount: nextUnreadCount,
    };

    runtimeRealtimeState = {
      ...runtimeRealtimeState,
      [roomId]: next,
    };

    onMessage({ roomId, ...next });
  }, intervalMs);

  return () => clearInterval(timer);
}

// ─────────────────────────────────────────────────────────────────────────────

const MOCK_OWNER_STATUS_BY_ID: Record<number, boolean> = {
  10: true,
  11: false,
  12: false,
  13: true,
  14: false,
  15: false,
  16: true,
  17: false,
  18: false,
  19: true,
  22: false,
  23: false,
  24: true,
  25: false,
};

export function getMockChatRoomOwnerStatus(ownerId: number): ChatRoomOwnerStatusDto {
  return {
    isOwner: Boolean(MOCK_OWNER_STATUS_BY_ID[ownerId]),
  };
}

// ─────────────────────────────────────────────────────────────────────────────

const MOCK_OTHER_LONG_MESSAGE = Array.from(
  { length: 22 },
  (_, index) => `${index + 1}줄: 오늘 논의한 내용을 정리해서 공유합니다.`,
).join("\n");

const MOCK_MY_LONG_MESSAGE = Array.from(
  { length: 12 },
  (_, index) => `${index + 1}줄: 제가 확인한 내용도 같이 남겨둘게요.`,
).join("\n");

const DEFAULT_MESSAGE_SEED: ChatMessageDto[] = [
  {
    messageId: 210,
    messageType: "TEXT",
    senderType: "USER",
    senderId: 3,
    content: "오늘 스터디 몇 시에 시작해?",
    images: [],
    sentAt: "2026-01-13T19:20:10+09:00",
  },
  {
    messageId: 209,
    messageType: "IMAGE",
    senderType: "USER",
    senderId: 5,
    content: null,
    images: [
      {
        url: "https://picsum.photos/seed/chat-image-1/320/220",
        expiresAt: "2026-01-13T19:25:00+09:00",
        key: "aosifsdg4132sdkghsi",
        sortOrder: 1,
      },
      {
        url: "https://picsum.photos/seed/chat-image-2/320/220",
        expiresAt: "2026-01-13T19:25:00+09:00",
        key: "aosifsdg4132sdkghsiasfgsdfgsd",
        sortOrder: 2,
      },
    ],
    sentAt: "2026-01-13T19:20:02+09:00",
  },
  {
    messageId: 208,
    messageType: "IMAGE",
    senderType: "USER",
    senderId: 5,
    content: null,
    images: [
      {
        url: "https://picsum.photos/seed/chat-image-3/320/220",
        expiresAt: "2026-01-13T19:25:00+09:00",
        key: "aosifsdg4132sdkghsisafsgsgsdg",
        sortOrder: 1,
      },
    ],
    sentAt: "2026-01-13T19:19:58+09:00",
  },
  {
    messageId: 207,
    messageType: "TEXT",
    senderType: "USER",
    senderId: 5,
    content: MOCK_OTHER_LONG_MESSAGE,
    images: [],
    sentAt: "2026-01-13T19:19:10+09:00",
  },
  {
    messageId: 206,
    messageType: "TEXT",
    senderType: "AI",
    senderId: null,
    content: "지원님이 들어왔습니다.",
    images: [],
    sentAt: "2026-01-13T19:18:40+09:00",
  },
  {
    messageId: 205,
    messageType: "TEXT",
    senderType: "USER",
    senderId: 3,
    content: MOCK_MY_LONG_MESSAGE,
    images: [],
    sentAt: "2026-01-13T19:18:10+09:00",
  },
  {
    messageId: 204,
    messageType: "TEXT",
    senderType: "USER",
    senderId: 7,
    content: "좋아요, 그럼 8시에 시작하죠.",
    images: [],
    sentAt: "2026-01-13T19:17:20+09:00",
  },
  {
    messageId: 203,
    messageType: "TEXT",
    senderType: "USER",
    senderId: 3,
    content: "확인했습니다!",
    images: [],
    sentAt: "2026-01-13T19:16:58+09:00",
  },
];

function getDefaultMessages(roomId: number): ChatMessageDto[] {
  return DEFAULT_MESSAGE_SEED.map((message) => ({
    ...message,
    messageId: message.messageId + roomId * 1000,
    sentAt: new Date(new Date(message.sentAt).getTime() + roomId * 30_000).toISOString(),
  })).sort((a, b) => b.messageId - a.messageId);
}

export function getMockChatRoomMessageListResponse({
  roomId,
  cursor,
  size = 50,
}: {
  roomId: number;
  cursor?: number;
  size?: number;
}): ChatMessageListResponseDto {
  const safeSize = Math.max(size, 1);
  const all = getDefaultMessages(roomId);
  const filtered =
    typeof cursor === "number" ? all.filter((message) => message.messageId < cursor) : all;
  const page = filtered.slice(0, safeSize);
  const content = [...page].reverse();
  const hasNext = filtered.length > safeSize;
  const nextCursor = hasNext ? (page[page.length - 1]?.messageId ?? null) : null;

  return {
    content,
    nextCursor,
    size: safeSize,
    hasNext,
  };
}

// ─────────────────────────────────────────────────────────────────────────────

interface GetMockChatRoomListOptions {
  type: ChatRoomType;
  page?: number;
  size?: number;
}

export function getMockChatRoomListResponse({
  type,
  page = 1,
  size = 10,
}: GetMockChatRoomListOptions): ChatRoomListResponseDto {
  const allItems = type === "OPEN_CHAT" ? OPEN_CHAT_MOCK_ITEMS : CAM_STUDY_MOCK_ITEMS;
  const safePage = Math.max(page, 1);
  const safeSize = Math.max(size, 1);
  const offset = (safePage - 1) * safeSize;
  const pagedItems = allItems.slice(offset, offset + safeSize);

  return {
    content: pagedItems,
    page: safePage,
    size: safeSize,
    totalElements: allItems.length,
    totalPages: Math.ceil(allItems.length / safeSize),
  };
}
