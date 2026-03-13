export interface CamStudyRoomSummaryDto {
  roomId: number;
  title: string;
  description: string;
  serverActive?: boolean | null;
  maxParticipants: number;
  participantsCount: number;
}

export interface CamStudyRoomListResponseDto {
  content: CamStudyRoomSummaryDto[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
