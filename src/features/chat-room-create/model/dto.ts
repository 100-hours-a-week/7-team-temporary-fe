import type { CreateChatRoomFormModel, CreateChatRoomRequestDto } from "./types";

export function toCreateChatRoomRequestDto(
  form: CreateChatRoomFormModel,
): CreateChatRoomRequestDto {
  return {
    type: form.type,
    title: form.title,
    description: form.description,
    maxParticipants: Number(form.maxParticipants),
  };
}
