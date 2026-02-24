export type ChatRoomType = "OPEN_CHAT" | "CAM_STUDY";

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
