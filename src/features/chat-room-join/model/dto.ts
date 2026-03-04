import type { JoinChatRoomFormModel, JoinChatRoomRequestDto } from "./types";

export function toJoinChatRoomRequestDto(form: JoinChatRoomFormModel): JoinChatRoomRequestDto {
  return {
    participantId: form.participantId,
  };
}
