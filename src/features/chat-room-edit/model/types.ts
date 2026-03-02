export interface EditChatRoomFormModel {
  title: string;
  description: string;
  maxParticipants: string;
}

export interface EditChatRoomRequestDto {
  title: string;
  description: string;
  maxParticipants: number;
}

export const EDIT_CHAT_ROOM_FORM_DEFAULTS: EditChatRoomFormModel = {
  title: "",
  description: "",
  maxParticipants: "10",
};
