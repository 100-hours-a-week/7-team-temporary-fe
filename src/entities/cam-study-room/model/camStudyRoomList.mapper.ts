import type { CamStudyRoomSummaryDto, CamStudyRoomListResponseDto } from "../api";

import type { CamStudyRoomListItemVM, CamStudyRoomListModel } from "./types";

function toCamStudyRoomListItemVM(dto: CamStudyRoomSummaryDto): CamStudyRoomListItemVM {
  return {
    roomId: dto.roomId,
    title: dto.title,
    description: dto.description,
    serverActive: dto.serverActive,
    maxParticipants: dto.maxParticipants,
    participantsCount: dto.participantsCount,
  };
}

export function toCamStudyRoomListModel(dto: CamStudyRoomListResponseDto): CamStudyRoomListModel {
  return {
    content: dto.content.map(toCamStudyRoomListItemVM),
    page: dto.page,
    size: dto.size,
    totalElements: dto.totalElements,
    totalPages: dto.totalPages,
  };
}
