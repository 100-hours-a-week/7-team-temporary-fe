import type { RegisterOptions } from "react-hook-form";

import type { EditChatRoomFormModel } from "./types";

export const EDIT_CHAT_ROOM_GROUP_NAME_MAX_LENGTH = 25;
export const EDIT_CHAT_ROOM_DESCRIPTION_MAX_LENGTH = 125;
export const EDIT_CHAT_ROOM_MAX_PARTICIPANTS_MIN = 2;
export const EDIT_CHAT_ROOM_MAX_PARTICIPANTS_MAX = 100;

export const EDIT_CHAT_ROOM_ERRORS = {
  TITLE_REQUIRED: "그룹 명을 입력해주세요.",
  TITLE_MAX_LENGTH: "그룹 명은 최대 25자까지 입력할 수 있습니다.",
  TITLE_REQUIRED_CHAR_CATEGORY:
    "그룹 명에는 한글, 영문(대/소문자), 특수문자 중 1자 이상이 포함되어야 합니다.",
  TITLE_EXCLUDED_SPECIAL_CHAR: "그룹 명에 사용할 수 없는 특수문자가 포함되어 있습니다.",
  DESCRIPTION_REQUIRED: "그룹 채팅방 설명을 입력해주세요.",
  DESCRIPTION_MAX_LENGTH: "설명은 최대 125자까지 입력할 수 있습니다.",
  MAX_PARTICIPANTS_REQUIRED: "모집 인원을 입력해주세요.",
  MAX_PARTICIPANTS_NOT_NUMBER: "숫자만 입력할 수 있습니다.",
  MAX_PARTICIPANTS_MIN: "모집 인원은 2명 이상이어야 합니다.",
  MAX_PARTICIPANTS_MAX: "모집 인원은 최대 100명까지 설정할 수 있습니다.",
} as const;

const EXCLUDED_SPECIAL_CHAR_REGEX = /[\\/:*?"<>|]/;
const REQUIRED_CHAR_CATEGORY_REGEX = /[A-Za-z가-힣]|[^0-9A-Za-z가-힣\s]/;

function trimString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function getGroupNameError(value: string): string | undefined {
  const trimmed = value.trim();

  if (!trimmed) return EDIT_CHAT_ROOM_ERRORS.TITLE_REQUIRED;
  if (trimmed.length > EDIT_CHAT_ROOM_GROUP_NAME_MAX_LENGTH) {
    return EDIT_CHAT_ROOM_ERRORS.TITLE_MAX_LENGTH;
  }
  if (EXCLUDED_SPECIAL_CHAR_REGEX.test(trimmed)) {
    return EDIT_CHAT_ROOM_ERRORS.TITLE_EXCLUDED_SPECIAL_CHAR;
  }
  if (!REQUIRED_CHAR_CATEGORY_REGEX.test(trimmed)) {
    return EDIT_CHAT_ROOM_ERRORS.TITLE_REQUIRED_CHAR_CATEGORY;
  }

  return undefined;
}

export const editChatRoomGroupNameRules: RegisterOptions<EditChatRoomFormModel, "title"> = {
  setValueAs: trimString,
  validate: (value) => getGroupNameError(value) ?? true,
};

export const editChatRoomDescriptionRules: RegisterOptions<EditChatRoomFormModel, "description"> = {
  setValueAs: trimString,
  required: EDIT_CHAT_ROOM_ERRORS.DESCRIPTION_REQUIRED,
  maxLength: {
    value: EDIT_CHAT_ROOM_DESCRIPTION_MAX_LENGTH,
    message: EDIT_CHAT_ROOM_ERRORS.DESCRIPTION_MAX_LENGTH,
  },
};

export const editChatRoomMaxParticipantsRules: RegisterOptions<
  EditChatRoomFormModel,
  "maxParticipants"
> = {
  setValueAs: trimString,
  required: EDIT_CHAT_ROOM_ERRORS.MAX_PARTICIPANTS_REQUIRED,
  pattern: {
    value: /^[0-9]+$/,
    message: EDIT_CHAT_ROOM_ERRORS.MAX_PARTICIPANTS_NOT_NUMBER,
  },
  validate: (value) => {
    const parsed = Number(value);
    if (Number.isNaN(parsed)) return EDIT_CHAT_ROOM_ERRORS.MAX_PARTICIPANTS_NOT_NUMBER;
    if (parsed < EDIT_CHAT_ROOM_MAX_PARTICIPANTS_MIN) {
      return EDIT_CHAT_ROOM_ERRORS.MAX_PARTICIPANTS_MIN;
    }
    if (parsed > EDIT_CHAT_ROOM_MAX_PARTICIPANTS_MAX) {
      return EDIT_CHAT_ROOM_ERRORS.MAX_PARTICIPANTS_MAX;
    }
    return true;
  },
};
