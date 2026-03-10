import type { ChatRoomListResponseDto, ChatRoomSummaryDto } from "../api";

import type { ChatRoomSearchItemVM, ChatRoomSearchListModel } from "./types";

function toChatRoomSearchItemVM(dto: ChatRoomSummaryDto): ChatRoomSearchItemVM {
  return {
    roomId: dto.roomId,
    type: dto.type ?? "OPEN_CHAT",
    title: dto.title,
    description: dto.description,
    maxParticipants: dto.maxParticipants,
    participantsCount: dto.participantsCount,
  };
}

export function toChatRoomSearchListModel(dto: ChatRoomListResponseDto): ChatRoomSearchListModel {
  return {
    content: dto.content.map(toChatRoomSearchItemVM),
    page: dto.page,
    size: dto.size,
    totalElements: dto.totalElements,
    totalPages: dto.totalPages,
  };
}
