import type { ChatMessageDto, ChatMessageListResponseDto } from "../api";

import type { ChatMessageItemVM, ChatMessageListModel } from "./types";

interface ToChatMessageListModelOptions {
  myUserId: number;
}

const CHAT_SENDER_PROFILE_MAP: Record<number, { name: string; profileImageUrl: string | null }> = {
  3: { name: "나", profileImageUrl: null },
  5: { name: "민지", profileImageUrl: "https://i.pravatar.cc/100?img=5" },
  7: { name: "지훈", profileImageUrl: "https://i.pravatar.cc/100?img=7" },
  9: { name: "서윤", profileImageUrl: "https://i.pravatar.cc/100?img=9" },
};

function toChatMessageItemVM(
  dto: ChatMessageDto,
  { myUserId }: ToChatMessageListModelOptions,
): ChatMessageItemVM {
  const senderType = dto.senderType;
  const senderId = typeof dto.senderId === "number" ? dto.senderId : null;
  const isMine = senderType === "USER" && senderId === myUserId;
  const senderProfile = senderId ? CHAT_SENDER_PROFILE_MAP[senderId] : undefined;

  return {
    messageId: dto.messageId,
    messageType: dto.messageType,
    senderType,
    senderId,
    senderName: senderType === "AI" ? "AI" : (senderProfile?.name ?? `사용자 ${senderId ?? "-"}`),
    senderProfileImageUrl: senderType === "AI" ? null : (senderProfile?.profileImageUrl ?? null),
    isMine,
    content: dto.content,
    imageUrls: (dto.images ?? []).map((image) => image.url).filter((url): url is string => !!url),
    sentAt: dto.sentAt,
  };
}

export function toChatMessageListModel(
  dto: ChatMessageListResponseDto,
  options: ToChatMessageListModelOptions,
): ChatMessageListModel {
  const content = dto.content.map((item) => toChatMessageItemVM(item, options));

  return {
    content,
    nextCursor: dto.nextCursor,
    size: dto.size,
    hasNext: dto.hasNext,
  };
}
