import type { ChatMessageDto, ChatMessageListResponseDto } from "../api";
import type { MessageCreatedPayload } from "@/shared/socket";

import type { ChatMessageItemVM, ChatMessageListModel } from "./types";

interface ToChatMessageListModelOptions {
  myUserId: number | null;
}

function toChatMessageItemVM(
  dto: ChatMessageDto,
  { myUserId }: ToChatMessageListModelOptions,
): ChatMessageItemVM {
  const senderType = dto.senderType;
  const senderId = typeof dto.senderId === "number" ? dto.senderId : null;
  const isMine =
    senderType === "USER" && senderId !== null && myUserId !== null && senderId === myUserId;

  return {
    messageId: dto.messageId,
    messageType: dto.messageType,
    senderType,
    senderId,
    senderName: senderType === "AI" ? "AI" : null,
    senderProfileImageUrl: null,
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

export function messageCreatedPayloadToVM(
  payload: MessageCreatedPayload,
  myUserId: number | null,
): ChatMessageItemVM {
  const isMine =
    payload.senderType === "USER" &&
    payload.senderId !== null &&
    myUserId !== null &&
    payload.senderId === myUserId;

  return {
    messageId: payload.messageId,
    messageType: payload.messageType,
    senderType: payload.senderType,
    senderId: payload.senderId,
    senderName: payload.senderType === "AI" ? "AI" : null,
    senderProfileImageUrl: null,
    isMine,
    content: payload.content,
    imageUrls: payload.images.map((img) => img.url).filter((url): url is string => !!url),
    sentAt: payload.sentAt,
  };
}
