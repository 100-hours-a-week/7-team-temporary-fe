import type { RegisterOptions } from "react-hook-form";

import type { CreateChatRoomFormModel } from "./types";

export const CREATE_CHAT_ROOM_GROUP_NAME_MAX_LENGTH = 25;

export const CREATE_CHAT_ROOM_GROUP_NAME_ERRORS = {
  REQUIRED: "그룹 명을 입력해주세요.",
  MAX_LENGTH: "그룹 명은 최대 25자까지 입력할 수 있습니다.",
  REQUIRED_CHAR_CATEGORY:
    "그룹 명에는 한글, 영문(대/소문자), 특수문자 중 1자 이상이 포함되어야 합니다.",
  EXCLUDED_SPECIAL_CHAR: "그룹 명에 사용할 수 없는 특수문자가 포함되어 있습니다.",
} as const;

export const CREATE_CHAT_ROOM_DESCRIPTION_MAX_LENGTH = 125;

export const CREATE_CHAT_ROOM_DESCRIPTION_ERRORS = {
  REQUIRED: "그룹 채팅방 설명을 입력해주세요.",
  MAX_LENGTH: "설명은 최대 125자까지 입력할 수 있습니다.",
} as const;

export const CREATE_CHAT_ROOM_MAX_PARTICIPANTS_DEFAULT = "10";
export const CREATE_CHAT_ROOM_MAX_PARTICIPANTS_MIN = 2;
export const CREATE_CHAT_ROOM_MAX_PARTICIPANTS_MAX = 100;

export const CREATE_CHAT_ROOM_MAX_PARTICIPANTS_ERRORS = {
  REQUIRED: "모집 인원을 입력해주세요.",
  NOT_NUMBER: "숫자만 입력할 수 있습니다.",
  MIN: "모집 인원은 2명 이상이어야 합니다.",
  MAX: "모집 인원은 최대 100명까지 설정할 수 있습니다.",
} as const;

const EXCLUDED_SPECIAL_CHAR_REGEX = /[\\/:*?"<>|]/;
const REQUIRED_CHAR_CATEGORY_REGEX = /[A-Za-z가-힣]|[^0-9A-Za-z가-힣\s]/;

function trimString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function getCreateChatRoomGroupNameError(value: string): string | undefined {
  const trimmed = value.trim();

  if (!trimmed) return CREATE_CHAT_ROOM_GROUP_NAME_ERRORS.REQUIRED;
  if (trimmed.length > CREATE_CHAT_ROOM_GROUP_NAME_MAX_LENGTH) {
    return CREATE_CHAT_ROOM_GROUP_NAME_ERRORS.MAX_LENGTH;
  }
  if (EXCLUDED_SPECIAL_CHAR_REGEX.test(trimmed)) {
    return CREATE_CHAT_ROOM_GROUP_NAME_ERRORS.EXCLUDED_SPECIAL_CHAR;
  }
  if (!REQUIRED_CHAR_CATEGORY_REGEX.test(trimmed)) {
    return CREATE_CHAT_ROOM_GROUP_NAME_ERRORS.REQUIRED_CHAR_CATEGORY;
  }

  return undefined;
}

export const createChatRoomGroupNameRules: RegisterOptions<CreateChatRoomFormModel, "title"> = {
  setValueAs: trimString,
  validate: (value) => getCreateChatRoomGroupNameError(value) ?? true,
};

export const createChatRoomDescriptionRules: RegisterOptions<
  CreateChatRoomFormModel,
  "description"
> = {
  setValueAs: trimString,
  required: CREATE_CHAT_ROOM_DESCRIPTION_ERRORS.REQUIRED,
  maxLength: {
    value: CREATE_CHAT_ROOM_DESCRIPTION_MAX_LENGTH,
    message: CREATE_CHAT_ROOM_DESCRIPTION_ERRORS.MAX_LENGTH,
  },
};

export const createChatRoomMaxParticipantsRules: RegisterOptions<
  CreateChatRoomFormModel,
  "maxParticipants"
> = {
  setValueAs: trimString,
  required: CREATE_CHAT_ROOM_MAX_PARTICIPANTS_ERRORS.REQUIRED,
  pattern: {
    value: /^[0-9]+$/,
    message: CREATE_CHAT_ROOM_MAX_PARTICIPANTS_ERRORS.NOT_NUMBER,
  },
  validate: (value) => {
    const parsed = Number(value);
    if (Number.isNaN(parsed)) return CREATE_CHAT_ROOM_MAX_PARTICIPANTS_ERRORS.NOT_NUMBER;
    if (parsed < CREATE_CHAT_ROOM_MAX_PARTICIPANTS_MIN) {
      return CREATE_CHAT_ROOM_MAX_PARTICIPANTS_ERRORS.MIN;
    }
    if (parsed > CREATE_CHAT_ROOM_MAX_PARTICIPANTS_MAX) {
      return CREATE_CHAT_ROOM_MAX_PARTICIPANTS_ERRORS.MAX;
    }
    return true;
  },
};
