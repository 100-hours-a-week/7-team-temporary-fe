import type { EditChatRoomFormModel, EditChatRoomRequestDto } from "./types";

export function toEditChatRoomRequestDto(form: EditChatRoomFormModel): EditChatRoomRequestDto {
  return {
    title: form.title,
    description: form.description,
    maxParticipants: Number(form.maxParticipants),
  };
}
