import { TASK_DURATION_OPTIONS, type TaskDurationOption } from "@/shared/validation";

import type { CreateDayPlanScheduleRequestDto, DayPlanScheduleDuration } from "../api";

const FORM_TO_DTO_DURATION_MAP: Record<TaskDurationOption, DayPlanScheduleDuration> = {
  "~30분": "MINUTE_UNDER_30",
  "30분~1시간": "MINUTE_30_TO_60",
  "1~2시간": "HOUR_1_TO_2",
  "2~4시간": "HOUR_2_TO_4",
  "4시간~": "HOUR_OVER_4",
};

const DTO_TO_FORM_DURATION_MAP: Record<DayPlanScheduleDuration, TaskDurationOption> = {
  MINUTE_UNDER_30: "~30분",
  MINUTE_30_TO_60: "30분~1시간",
  HOUR_1_TO_2: "1~2시간",
  HOUR_2_TO_4: "2~4시간",
  HOUR_OVER_4: "4시간~",
};

export type DayPlanScheduleCreatePayload = CreateDayPlanScheduleRequestDto;

export function toDayPlanScheduleDuration(duration: TaskDurationOption | null) {
  if (!duration) return undefined;
  return FORM_TO_DTO_DURATION_MAP[duration];
}

export function toTaskDurationOption(
  duration: DayPlanScheduleDuration | TaskDurationOption | string | null | undefined,
) {
  if (!duration) return null;
  if (TASK_DURATION_OPTIONS.includes(duration as TaskDurationOption)) {
    return duration as TaskDurationOption;
  }
  if (duration in DTO_TO_FORM_DURATION_MAP) {
    return DTO_TO_FORM_DURATION_MAP[duration as DayPlanScheduleDuration];
  }
  return null;
}
