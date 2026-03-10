import type { CamStudyRoomSummaryDto, CamStudyRoomListResponseDto } from "./types";

const CAM_STUDY_MOCK_ITEMS: CamStudyRoomSummaryDto[] = [
  {
    roomId: 101,
    title: "1번 캠 스터디방",
    description: "집중 스터디 기본 룸",
    serverActive: true,
    maxParticipants: 20,
    participantsCount: 0,
  },
  {
    roomId: 102,
    title: "2번 캠 스터디방",
    description: "오전 집중 세션",
    serverActive: true,
    maxParticipants: 20,
    participantsCount: 3,
  },
  {
    roomId: 103,
    title: "3번 캠 스터디방",
    description: "오후 몰입 세션",
    serverActive: true,
    maxParticipants: 20,
    participantsCount: 8,
  },
  {
    roomId: 104,
    title: "4번 캠 스터디방",
    description: "집중 인증 스터디",
    serverActive: true,
    maxParticipants: 20,
    participantsCount: 17,
  },
  {
    roomId: 105,
    title: "5번 캠 스터디방",
    description: "저녁 타임 집중 스터디",
    serverActive: true,
    maxParticipants: 20,
    participantsCount: 19,
  },
  {
    roomId: 106,
    title: "6번 캠 스터디방",
    description: "만석 상태 테스트 룸",
    serverActive: true,
    maxParticipants: 20,
    participantsCount: 20,
  },
  {
    roomId: 107,
    title: "7번 캠 스터디방",
    description: "서버 점검 중",
    serverActive: false,
    maxParticipants: 20,
    participantsCount: 0,
  },
  {
    roomId: 108,
    title: "8번 캠 스터디방",
    description: "주말 집중 세션",
    serverActive: true,
    maxParticipants: 20,
    participantsCount: 5,
  },
  {
    roomId: 109,
    title: "9번 캠 스터디방",
    description: "혼잡 상태 테스트 룸",
    serverActive: true,
    maxParticipants: 20,
    participantsCount: 18,
  },
  {
    roomId: 110,
    title: "10번 캠 스터디방",
    description: "새벽 집중 세션",
    serverActive: true,
    maxParticipants: 20,
    participantsCount: 1,
  },
];

export function getMockCamStudyRoomListResponse({
  page = 1,
  size = 10,
}: {
  page?: number;
  size?: number;
}): CamStudyRoomListResponseDto {
  const safePage = Math.max(page, 1);
  const safeSize = Math.max(size, 1);
  const offset = (safePage - 1) * safeSize;
  const pagedItems = CAM_STUDY_MOCK_ITEMS.slice(offset, offset + safeSize);

  return {
    content: pagedItems,
    page: safePage,
    size: safeSize,
    totalElements: CAM_STUDY_MOCK_ITEMS.length,
    totalPages: Math.ceil(CAM_STUDY_MOCK_ITEMS.length / safeSize),
  };
}
