export interface CamStudyRoomListItemVM {
  roomId: number;
  title: string;
  description: string;
  serverActive: boolean;
  maxParticipants: number;
  participantsCount: number;
}

export interface CamStudyRoomListModel {
  content: CamStudyRoomListItemVM[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
