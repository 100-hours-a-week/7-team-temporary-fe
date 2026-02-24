import type { ChatRoomType } from "../api";

/** ChatRoomList UI에서 사용하는 뷰 모델 (REST + WebSocket 병합) */
export interface ChatRoomListItemVM {
  roomId: number;
  type: ChatRoomType;
  title: string;
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
