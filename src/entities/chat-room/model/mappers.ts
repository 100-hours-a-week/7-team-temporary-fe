import type { ChatRoomSummaryDto, ChatRoomListResponseDto, MockRealtimeEntry } from "../api";

import type { ChatRoomListItemVM, ChatRoomListModel } from "./types";

function toChatRoomListItemVM(
  dto: ChatRoomSummaryDto,
  realtime?: MockRealtimeEntry,
): ChatRoomListItemVM {
  return {
    roomId: dto.roomId,
    type: dto.type,
    title: dto.title,
    participantsCount: dto.participantsCount,
    lastMessage: realtime?.lastMessage,
    lastMessageAt: realtime?.lastMessageAt,
    unreadCount: realtime?.unreadCount ?? 0,
  };
}

export function toChatRoomListModel(
  dto: ChatRoomListResponseDto,
  realtimeStateMap?: Record<number, MockRealtimeEntry>,
): ChatRoomListModel {
  return {
    content: dto.content.map((item) => toChatRoomListItemVM(item, realtimeStateMap?.[item.roomId])),
    page: dto.page,
    size: dto.size,
    totalElements: dto.totalElements,
    totalPages: dto.totalPages,
  };
}
