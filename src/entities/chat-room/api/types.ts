export type ChatRoomType = "OPEN_CHAT" | "CAM_STUDY";
export type ChatMessageType = "TEXT" | "FILE";
export type ChatMessageSenderType = "USER" | "AI";

/** GET /chat-rooms/participants?type=&page=&size= 응답 content 항목 */
export interface ChatRoomSummaryDto {
  roomId: number;
  type: ChatRoomType;
  title: string;
  description: string;
  maxParticipants: number;
  participantsCount: number;
}

export interface ChatRoomListResponseDto {
  content: ChatRoomSummaryDto[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

/** GET /chat-rooms/participants/{ownerId} 응답 */
export interface ChatRoomOwnerStatusDto {
  isOwner: boolean;
}

export interface ChatMessageImageDto {
  url: string;
  expiresAt?: string | null;
  key?: string;
  sortOrder?: number;
}

/** GET /chat-rooms/{roomId}/message content 항목 */
export interface ChatMessageDto {
  messageId: number;
  messageType: ChatMessageType;
  senderType: ChatMessageSenderType;
  senderId: number | null;
  content: string | null;
  images: ChatMessageImageDto[];
  sentAt: string;
}

export interface ChatMessageListResponseDto {
  content: ChatMessageDto[];
  nextCursor: number | null;
  size: number;
  hasNext: boolean;
}
