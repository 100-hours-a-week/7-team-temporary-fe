import {
  toDayPlanScheduleDuration,
  toTaskDurationOption,
  type DayPlanScheduleCreatePayload,
  type TodoCartTaskItemModel,
} from "@/entities/day-plan-schedule";
import { formatMinutesToHHmm, splitHHmmToParts } from "@/shared/lib";

import { TASK_BASKET_FORM_DEFAULTS, type TaskBasketFormModel } from "./types";

interface CreateDayPlanScheduleRequestDtoParams {
  form: TaskBasketFormModel;
  shouldShowTimeFields: boolean;
  startAt: string;
  endAt: string;
}

function toDurationMinutes(hourText: string, minuteText: string) {
  if (hourText === "" || minuteText === "") return null;
  const hour = Number(hourText);
  const minute = Number(minuteText);
  if (Number.isNaN(hour) || Number.isNaN(minute)) return null;
  return hour * 60 + minute;
}

export function toCreateDayPlanScheduleRequestDto({
  form,
  shouldShowTimeFields,
  startAt,
  endAt,
}: CreateDayPlanScheduleRequestDtoParams): DayPlanScheduleCreatePayload {
  const title = form.content.trim();

  if (form.isFixed) {
    return {
      title,
      type: "FIXED",
      startAt,
      endAt,
    };
  }

  const flexPayload: DayPlanScheduleCreatePayload = {
    title,
    type: "FLEX",
    estimatedTimeRange: toDayPlanScheduleDuration(form.duration),
    focusLevel: form.immersion,
    isUrgent: form.isUrgent,
  };

  if (!shouldShowTimeFields) {
    return flexPayload;
  }

  return {
    ...flexPayload,
    startAt,
    endAt,
  };
}

export function toTaskBasketTimeRange(form: TaskBasketFormModel, shouldUseTime: boolean) {
  const startMinutes = shouldUseTime ? toDurationMinutes(form.startHour, form.startMinute) : null;
  const endMinutes = shouldUseTime ? toDurationMinutes(form.endHour, form.endMinute) : null;

  return {
    startMinutes,
    endMinutes,
    startAt: startMinutes === null ? "" : formatMinutesToHHmm(startMinutes),
    endAt: endMinutes === null ? "" : formatMinutesToHHmm(endMinutes),
  };
}

export function toTaskBasketFormModelFromTask(
  task: Pick<
    TodoCartTaskItemModel,
    "title" | "type" | "startAt" | "endAt" | "estimatedTimeRange" | "focusLevel" | "isUrgent"
  >,
): TaskBasketFormModel {
  const { hour: startHour, minute: startMinute } = splitHHmmToParts(task.startAt);
  const { hour: endHour, minute: endMinute } = splitHHmmToParts(task.endAt);

  return {
    ...TASK_BASKET_FORM_DEFAULTS,
    content: task.title ?? "",
    isFixed: task.type === "FIXED",
    startHour,
    startMinute,
    endHour,
    endMinute,
    duration: toTaskDurationOption(task.estimatedTimeRange),
    immersion: task.focusLevel ?? TASK_BASKET_FORM_DEFAULTS.immersion,
    isUrgent: Boolean(task.isUrgent),
  };
}
