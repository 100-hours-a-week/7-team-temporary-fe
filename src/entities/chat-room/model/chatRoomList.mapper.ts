import type { ChatRoomListResponseDto, ChatRoomSummaryDto } from "../api";

import type { ChatRoomListItemVM, ChatRoomListModel } from "./types";

function pickFirstString(candidates: Array<string | null | undefined>) {
  return candidates.find((value): value is string => typeof value === "string" && value.length > 0);
}

function pickFirstNumber(candidates: Array<number | null | undefined>, fallback = 0) {
  const picked = candidates.find((value): value is number => typeof value === "number");
  return picked ?? fallback;
}

function toChatRoomListItemVM(dto: ChatRoomSummaryDto): ChatRoomListItemVM {
  const lastMessage = pickFirstString([dto.lastUserMessagePreview]);
  const lastMessageAt = pickFirstString([dto.lastUserMessageSentAt]);
  const unreadCount = pickFirstNumber([dto.unreadCount], 0);

  return {
    roomId: dto.roomId,
    title: dto.title,
    description: dto.description,
    maxParticipants: dto.maxParticipants,
    participantsCount: dto.participantsCount,
    lastMessage,
    lastMessageAt,
    unreadCount,
  };
}

export function toChatRoomListModel(dto: ChatRoomListResponseDto): ChatRoomListModel {
  return {
    content: dto.content.map((item) => toChatRoomListItemVM(item)),
    page: dto.page,
    size: dto.size,
    totalElements: dto.totalElements,
    totalPages: dto.totalPages,
  };
}
