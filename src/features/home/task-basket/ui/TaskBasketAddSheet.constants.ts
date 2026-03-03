export const TASK_BASKET_SHEET_PEEK_HEIGHT = 85;
export const TASK_BASKET_SHEET_EXPAND_HEIGHT = 90;
export const TASK_BASKET_CONTENT_MAX_LENGTH = 25;

export const TASK_BASKET_DEFAULT_DAY_END_HOUR = 23;
export const TASK_BASKET_DEFAULT_DAY_END_MINUTE = 50;
export const TASK_BASKET_DAY_END_MIN_THRESHOLD = 12 * 60;
export const TASK_BASKET_MINUTE_OPTIONS = [0, 10, 20, 30, 40, 50] as const;

export const TASK_BASKET_VALIDATE_OPTIONS = { shouldValidate: true } as const;
export const TASK_BASKET_VALIDATE_DIRTY_OPTIONS = {
  shouldValidate: true,
  shouldDirty: true,
} as const;

export const TASK_BASKET_CREATE_TITLE = "할 일";
export const TASK_BASKET_EDIT_TITLE = "할 일 수정";
export const TASK_BASKET_CREATE_SUBMIT_LABEL = "할 일 추가";
export const TASK_BASKET_EDIT_SUBMIT_LABEL = "수정하기";

export const TASK_BASKET_CONTENT_LABEL = "할 일 내용";
export const TASK_BASKET_CONTENT_PLACEHOLDER = "스크럼 시간";
export const TASK_BASKET_FIXED_TIME_LABEL = "고정 시간";
export const TASK_BASKET_AI_TIME_HINT =
  "고정 시간이 지정되어있지 않을 경우, AI가 잘 맞는 시간대로 배치합니다!";
export const TASK_BASKET_IMMERSION_LABEL = "몰입도";
export const TASK_BASKET_URGENT_LABEL = "급해요";

export const TASK_BASKET_NO_DAY_PLAN_MESSAGE = "일정을 생성할 날짜 정보가 없습니다.";
export const TASK_BASKET_TIME_CONFLICT_MESSAGE = "기존 시간에 다른 일정이 이미 존재합니다.";
export const TASK_BASKET_CREATE_SUCCESS_MESSAGE = "할 일이 추가되었습니다.";
export const TASK_BASKET_UPDATE_SUCCESS_MESSAGE = "할 일이 수정되었습니다.";
