import type { ChatRoomSummaryDto, ChatRoomListResponseDto, ChatRoomType } from "./types";

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
