import type {
  ChatMessageSenderType as ChatMessageSenderContractType,
  ChatMessageType as ChatMessageContractType,
} from "@/shared/model";

export type ChatRoomType = "OPEN_CHAT" | "CAM_STUDY";
export type ChatMessageType = ChatMessageContractType;
export type ChatMessageSenderType = ChatMessageSenderContractType;

/** GET /chat-rooms/participants?type=OPEN_CHAT 응답 content 항목 */
export interface ChatRoomSummaryDto {
  roomId: number;
  type?: ChatRoomType | null;
  title: string;
  description: string;
  maxParticipants: number;
  participantsCount: number;
  lastUserMessagePreview?: string | null;
  lastUserMessageSentAt?: string | null;
  unreadCount?: number | null;
}

export interface ChatRoomListResponseDto {
  content: ChatRoomSummaryDto[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

/** GET /chat-rooms/{roomId}/owner/{ownerId} 응답 */
export interface ChatRoomOwnerStatusDto {
  isOwner: boolean;
}

export interface ChatRoomProfileImageDto {
  url: string;
  expiresAt?: string | null;
  key?: string;
}

export interface ChatRoomOwnerDto {
  participantId?: number;
  userId: number;
  nickname: string;
  cameraEnabled: boolean;
  profileImage?: ChatRoomProfileImageDto | null;
}

export interface ChatRoomParticipantDto {
  participantId: number;
  userId: number;
  nickname: string;
  cameraEnabled: boolean;
  profileImage?: ChatRoomProfileImageDto | null;
  lastSeenMessageId?: number | null;
  joinedAt: string;
}

/** GET /chat-rooms/{roomId} 응답 */
export interface ChatRoomDetailDto {
  roomId: number;
  type: ChatRoomType;
  title: string;
  description: string;
  maxParticipants: number;
  owner: ChatRoomOwnerDto;
  participants: ChatRoomParticipantDto[];
  participantsCount: number;
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
  senderNickname?: string | null;
  senderProfile?: ChatRoomProfileImageDto | null;
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
