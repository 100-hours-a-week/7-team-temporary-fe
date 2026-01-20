const DAY_END_TIME_REGEX = /^\d{2}:\d{2}$/;

export const DAY_END_TIME_ERRORS = {
  REQUIRED: "하루 종료 시간을 입력해주세요.",
  INVALID_FORMAT: "하루 종료 시간은 HH:MM 형식이어야 합니다.",
} as const;

export const getDayEndTimeError = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return DAY_END_TIME_ERRORS.REQUIRED;
  if (!DAY_END_TIME_REGEX.test(trimmed)) {
    return DAY_END_TIME_ERRORS.INVALID_FORMAT;
  }
  const [hour, minute] = trimmed.split(":").map(Number);
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    return DAY_END_TIME_ERRORS.INVALID_FORMAT;
  }
  return undefined;
};

export const isDayEndTimeValid = (value: string) => !getDayEndTimeError(value);
