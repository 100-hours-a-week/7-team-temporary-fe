import type { ChatMessageSenderType, ChatMessageType, ChatRoomType } from "../api";

/** 그룹 채팅방(OPEN_CHAT) 목록 뷰 모델 (REST + WebSocket 병합) */
export interface ChatRoomListItemVM {
  roomId: number;
  title: string;
  description: string;
  maxParticipants: number;
  participantsCount: number;
  /** WebSocket 수신 전이면 undefined */
  lastMessage?: string;
  /** WebSocket 수신 전이면 undefined */
  lastMessageAt?: string;
  unreadCount: number;
}

export interface ChatRoomListModel {
  content: ChatRoomListItemVM[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface ChatMessageItemVM {
  messageId: number;
  messageType: ChatMessageType;
  senderType: ChatMessageSenderType;
  senderId: number | null;
  senderNickname: string | null;
  senderProfile: {
    url: string;
    expiresAt?: string | null;
    key?: string;
  } | null;
  isMine: boolean;
  content: string | null;
  imageUrls: string[];
  sentAt: string;
}

export interface ChatMessageListModel {
  content: ChatMessageItemVM[];
  nextCursor: number | null;
  size: number;
  hasNext: boolean;
}

export interface ChatRoomMemberVM {
  participantId: number | null;
  userId: number;
  nickname: string;
  cameraEnabled: boolean;
  profileImageUrl: string | null;
  lastSeenMessageId?: number | null;
  joinedAt: string | null;
  role: "OWNER" | "PARTICIPANT";
}

export interface ChatRoomDetailModel {
  roomId: number;
  type: ChatRoomType;
  title: string;
  description: string;
  maxParticipants: number;
  participantsCount: number;
  owner: ChatRoomMemberVM;
  participants: ChatRoomMemberVM[];
}
