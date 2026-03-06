import type { ChatRoomDetailDto, ChatRoomOwnerDto, ChatRoomParticipantDto } from "../api";

import type { ChatRoomDetailModel, ChatRoomMemberVM } from "./types";

function toOwnerVM(owner: ChatRoomOwnerDto): ChatRoomMemberVM {
  return {
    participantId: null,
    userId: owner.userId,
    nickname: owner.nickname,
    cameraEnabled: owner.cameraEnabled,
    profileImageUrl: owner.profileImage?.url ?? null,
    lastSeenMessageId: null,
    joinedAt: null,
    role: "OWNER",
  };
}

function toParticipantVM(participant: ChatRoomParticipantDto): ChatRoomMemberVM {
  return {
    participantId: participant.participantId,
    userId: participant.userId,
    nickname: participant.nickname,
    cameraEnabled: participant.cameraEnabled,
    profileImageUrl: participant.profileImage?.url ?? null,
    lastSeenMessageId: participant.lastSeenMessageId ?? null,
    joinedAt: participant.joinedAt,
    role: "PARTICIPANT",
  };
}

export function toChatRoomDetailModel(dto: ChatRoomDetailDto): ChatRoomDetailModel {
  return {
    roomId: dto.roomId,
    type: dto.type,
    title: dto.title,
    description: dto.description,
    maxParticipants: dto.maxParticipants,
    participantsCount: dto.participantsCount,
    owner: toOwnerVM(dto.owner),
    participants: dto.participants.map(toParticipantVM),
  };
}
