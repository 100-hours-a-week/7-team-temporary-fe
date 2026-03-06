import type { CreateChatRoomFormModel, CreateChatRoomRequestDto } from "./types";

export function toCreateChatRoomRequestDto(
  form: CreateChatRoomFormModel,
): CreateChatRoomRequestDto {
  return {
    title: form.title,
    description: form.description,
    maxParticipants: Number(form.maxParticipants),
  };
}
