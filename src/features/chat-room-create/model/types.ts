export interface CreateChatRoomFormModel {
  title: string;
  description: string;
  maxParticipants: string;
}

export interface CreateChatRoomRequestDto {
  type: "OPEN_CHAT";
  title: string;
  description: string;
  maxParticipants: number;
}

export interface CreateChatRoomResponseDto {
  roomId: number;
}

export const CREATE_CHAT_ROOM_FORM_DEFAULTS: CreateChatRoomFormModel = {
  title: "",
  description: "",
  maxParticipants: "10",
};
