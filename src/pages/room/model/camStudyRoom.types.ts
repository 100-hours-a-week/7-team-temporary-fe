export interface CamStudyParticipantVM {
  userId: number;
  nickname: string;
  cameraEnabled: boolean;
  screenVisible: boolean;
  isMe: boolean;
  profileImageUrl: string | null;
  joinedAt: string;
  role: "OWNER" | "PARTICIPANT";
}

export interface CamStudyRoomSummary {
  activeCamParticipantsCount: number;
  participantsCount: number;
  maxParticipants: number;
}
