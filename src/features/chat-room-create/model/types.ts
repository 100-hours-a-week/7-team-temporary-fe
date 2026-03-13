import type { ChatRoomType } from "@/entities/chat-room";

export type CreatableChatRoomType = Extract<ChatRoomType, "OPEN_CHAT" | "CAM_STUDY">;

export interface CreateChatRoomFormModel {
  type: CreatableChatRoomType;
  title: string;
  description: string;
  maxParticipants: string;
}

export interface CreateChatRoomRequestDto {
  title: string;
  description: string;
  maxParticipants: number;
}

export interface CreateChatRoomResponseDto {
  roomId: number;
  participantId: number;
}

export interface CreateChatRoomTypeOptionVM {
  type: CreatableChatRoomType;
  label: string;
  description: string;
}

export const CREATE_CHAT_ROOM_FORM_DEFAULTS: CreateChatRoomFormModel = {
  type: "OPEN_CHAT",
  title: "",
  description: "",
  maxParticipants: "10",
};

export const CREATE_CHAT_ROOM_TYPE_OPTIONS: ReadonlyArray<CreateChatRoomTypeOptionVM> = [
  {
    type: "OPEN_CHAT",
    label: "오픈채팅방",
    description: "누구나 참여 가능한 채팅방",
  },
  {
    type: "CAM_STUDY",
    label: "캠 스터디방",
    description: "캠 기반 스터디방",
  },
] as const;
