export const TASK_BASKET_PAGE_HEADER_TITLE = "작업 리스트";
export const TASK_BASKET_FLOW_ACTION_BUTTON_LABEL = "플래너 배치하기";
export const TASK_BASKET_ADD_TASK_ARIA_LABEL = "할 일 추가";
export const TASK_BASKET_TODO_LIST_TITLE = "수행되지 않은 Todo list";

export const TASK_BASKET_DELETE_DIALOG_TITLE = "정말 삭제할까요?";
export const TASK_BASKET_DELETE_DIALOG_DESCRIPTION = "삭제한 작업은 복구할 수 없습니다.";
export const TASK_BASKET_DELETE_DIALOG_CONFIRM_LABEL = "삭제";
export const TASK_BASKET_DELETE_DIALOG_CONFIRM_PENDING_LABEL = "삭제 중...";
export const TASK_BASKET_DELETE_DIALOG_CANCEL_LABEL = "취소";

export const TASK_BASKET_FLOW_DEFAULT_SHEET_HEIGHT = 35;
export const TASK_BASKET_FLOW_TASK_SPLIT_SHEET_HEIGHT = 70;
export const TASK_BASKET_FLOW_LOADING_MESSAGE = "상태를 확인하는 중...";

export const TASK_BASKET_AI_SHEET_TITLE_LINE1 = "시간이 입력되어 있지 않은";
export const TASK_BASKET_AI_SHEET_TITLE_LINE2 = "작업이 존재합니다.";
export const TASK_BASKET_AI_SHEET_DESCRIPTION = "집중 시간에 따라 AI가 자동으로 배치할께요!";
export const TASK_BASKET_AI_SHEET_INFO_PREFIX = "남은 자동 배치 횟수: ";
export const TASK_BASKET_AI_SHEET_INFO_SUFFIX = "회";
export const TASK_BASKET_AI_SHEET_PRIMARY_LABEL = "자동배치";
export const TASK_BASKET_AI_SHEET_SECONDARY_LABEL = "취소";
export const TASK_BASKET_AI_SHEET_PRIMARY_LOADING_LABEL = "배치 중...";

export const TASK_BASKET_LONG_DURATION_VALUES = new Set([
  "HOUR_2_TO_4",
  "HOUR_OVER_4",
  "2~4시간",
  "4시간~",
]);
export const TASK_BASKET_OVER_FOUR_HOURS_VALUES = new Set(["HOUR_OVER_4", "4시간~"]);
export const TASK_BASKET_SPLIT_ITEM_PLACEHOLDER = "하위 작업을 입력하세요";
export const TASK_BASKET_SPLIT_MIN_ITEMS_DEFAULT = 2;
export const TASK_BASKET_SPLIT_MIN_ITEMS_OVER_FOUR_HOURS = 3;
export const TASK_BASKET_SPLIT_SHEET_TITLE = "해당 작업은 너무 포괄적이에요!";
export const TASK_BASKET_SPLIT_SHEET_DESCRIPTION_LINE1 = "작업을 세분화 해주세요.";
export const TASK_BASKET_SPLIT_SHEET_DESCRIPTION_LINE2 =
  "상위 작업을 여러 개의 하위 작업으로 나누어";
export const TASK_BASKET_SPLIT_SHEET_DESCRIPTION_LINE3 = "단계별로 관리할 수 있습니다.";
export const TASK_BASKET_SPLIT_SHEET_DESCRIPTION_LINE4 =
  "하위작업은 예상 소요시간이 1~2시간으로 변경됩니다.";
export const TASK_BASKET_SPLIT_SHEET_SUBMIT_LABEL = "완료";
export const TASK_BASKET_SPLIT_SHEET_SUBMIT_PENDING_LABEL = "저장 중...";
export const TASK_BASKET_SPLIT_SHEET_REMOVE_ITEM_ARIA_LABEL = "하위 작업 삭제";

export const TASK_BASKET_WEEKDAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"] as const;
