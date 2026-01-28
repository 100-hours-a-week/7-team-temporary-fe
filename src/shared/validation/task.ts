export const TASK_CONTENT_MAX_LENGTH = 25;

export const TASK_CONTENT_ERRORS = {
  REQUIRED: "할 일 내용을 입력해주세요.",
  INVALID_CHAR: "한글 또는 영문이 포함되어야 합니다.",
  MAX_LENGTH: "최대 25자까지 입력할 수 있습니다.",
} as const;

export const TASK_TIME_ERRORS = {
  REQUIRED: "시간을 모두 선택해주세요.",
  INVALID_RANGE: "종료 시간은 시작 시간보다 늦어야 합니다.",
} as const;

export const TASK_DURATION_ERRORS = {
  REQUIRED: "소요 시간을 선택해주세요.",
} as const;

export const TASK_DURATION_OPTIONS = [
  "~30분",
  "30분~1시간",
  "1~2시간",
  "2~4시간",
  "4시간~",
] as const;

export type TaskDurationOption = (typeof TASK_DURATION_OPTIONS)[number];

const hasKoreanOrEnglish = (value: string) => /[A-Za-z가-힣]/.test(value);

export const getTaskContentError = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return TASK_CONTENT_ERRORS.REQUIRED;
  if (!hasKoreanOrEnglish(trimmed)) return TASK_CONTENT_ERRORS.INVALID_CHAR;
  if (trimmed.length > TASK_CONTENT_MAX_LENGTH) return TASK_CONTENT_ERRORS.MAX_LENGTH;
  return undefined;
};

const parseNumber = (value: string) => {
  if (value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

const isHourValid = (value: number) => value >= 0 && value <= 23;
const isMinuteValid = (value: number) => value >= 0 && value <= 59;

export const getTaskTimeRangeError = (
  startHour: string,
  startMinute: string,
  endHour: string,
  endMinute: string,
) => {
  const startH = parseNumber(startHour);
  const startM = parseNumber(startMinute);
  const endH = parseNumber(endHour);
  const endM = parseNumber(endMinute);

  if (
    startH === null ||
    startM === null ||
    endH === null ||
    endM === null ||
    !isHourValid(startH) ||
    !isHourValid(endH) ||
    !isMinuteValid(startM) ||
    !isMinuteValid(endM)
  ) {
    return TASK_TIME_ERRORS.REQUIRED;
  }

  const start = startH * 60 + startM;
  const end = endH * 60 + endM;

  if (start >= end) {
    return TASK_TIME_ERRORS.INVALID_RANGE;
  }

  return undefined;
};
