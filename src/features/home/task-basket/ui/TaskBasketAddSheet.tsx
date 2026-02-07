"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import type { TodoCartTaskItemModel } from "@/features/home/model/taskModels";
import type { TaskDurationOption } from "@/shared/validation";
import {
  TASK_BASKET_FORM_DEFAULTS,
  useTaskBasketForm,
  type TaskBasketFormModel,
} from "@/features/home/task-basket/model";
import { TASK_DURATION_OPTIONS } from "@/shared/validation";
import type {
  CreateDayPlanScheduleRequestDto,
  DayPlanScheduleDuration,
  DayPlanScheduleItemDto,
  DayPlanScheduleStatus,
} from "@/features/home/api";
import { Endpoint } from "@/shared/api";
import { useApiMutation, useMutationErrorEffect } from "@/shared/query";
import { BottomSheet } from "@/shared/ui";
import { FormField, BASE_INPUT_CLASS_NAME } from "@/shared/form/ui";
import { PrimaryButton } from "@/shared/ui/button";
import { useToast } from "@/shared/ui/toast";
import { useUserPreferencesStore } from "@/entities/user";

type TodoTask = TodoCartTaskItemModel & { status?: DayPlanScheduleStatus };

interface TaskBasketAddSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tasks: TodoTask[];
  dayPlanId: number | null;
  invalidateKeys?: Array<readonly unknown[]>;
  onAddTask: (task: TodoTask) => void;
  editingTask?: TodoTask | null;
  onUpdateTask?: (task: TodoTask) => void;
}

export function TaskBasketAddSheet({
  open,
  onOpenChange,
  tasks,
  dayPlanId,
  invalidateKeys,
  onAddTask,
  editingTask = null,
  onUpdateTask,
}: TaskBasketAddSheetProps) {
  const { showToast } = useToast();
  const [isExpanded, setIsExpanded] = useState(true);
  const isEditMode = Boolean(editingTask);
  const isAssignedFlexEditing =
    Boolean(editingTask) &&
    editingTask?.assignmentStatus === "ASSIGNED" &&
    editingTask?.type === "FLEX";
  const hasEditingTime = Boolean(editingTask?.startAt && editingTask?.endAt);

  const hasTimeConflict = (newStart: number, newEnd: number) =>
    tasks.some((task) => {
      if (!task.startAt || !task.endAt) return false;
      const [startH, startM] = task.startAt.split(":").map(Number);
      const [endH, endM] = task.endAt.split(":").map(Number);
      if ([startH, startM, endH, endM].some((value) => Number.isNaN(value))) return false;
      const taskStart = startH * 60 + startM;
      const taskEnd = endH * 60 + endM;
      return newStart < taskEnd && newEnd > taskStart;
    });

  const handleClose = () => {
    onOpenChange(false);
  };

  const createScheduleMutation = useApiMutation<
    CreateDayPlanScheduleRequestDto,
    CreateDayPlanScheduleRequestDto,
    DayPlanScheduleItemDto | undefined
  >({
    url: () => {
      if (!dayPlanId) {
        throw new Error("dayPlanId가 없습니다.");
      }
      return Endpoint.DAY_PLAN.SCHEDULE_BY_ID(dayPlanId);
    },
    method: "POST",
    dtoFn: (payload) => payload,
    authRequired: true,
    refreshOnUnauthorized: true,
    invalidateKeys: invalidateKeys ?? [],
  });
  const updateScheduleMutation = useApiMutation<
    CreateDayPlanScheduleRequestDto,
    CreateDayPlanScheduleRequestDto,
    void
  >({
    url: () => {
      if (!editingTask) {
        throw new Error("editingTask가 없습니다.");
      }
      return Endpoint.SCHEDULE.BY_ID(editingTask.scheduleId);
    },
    method: "PUT",
    dtoFn: (payload) => payload,
    authRequired: true,
    refreshOnUnauthorized: true,
    invalidateKeys: invalidateKeys ?? [],
  });
  useMutationErrorEffect(createScheduleMutation);
  useMutationErrorEffect(updateScheduleMutation);

  const mapDurationToApi = (duration: TaskDurationOption | null) => {
    if (!duration) return undefined;
    const durationMap: Record<TaskDurationOption, DayPlanScheduleDuration> = {
      "~30분": "MINUTE_UNDER_30",
      "30분~1시간": "MINUTE_30_TO_60",
      "1~2시간": "HOUR_1_TO_2",
      "2~4시간": "HOUR_2_TO_4",
      "4시간~": "HOUR_OVER_4",
    };
    return durationMap[duration];
  };

  const mapDurationFromApi = (duration: DayPlanScheduleDuration | TaskDurationOption | null) => {
    if (!duration) return null;
    if (TASK_DURATION_OPTIONS.includes(duration as TaskDurationOption)) {
      return duration as TaskDurationOption;
    }
    const durationMap: Record<DayPlanScheduleDuration, TaskDurationOption> = {
      MINUTE_UNDER_30: "~30분",
      MINUTE_30_TO_60: "30분~1시간",
      HOUR_1_TO_2: "1~2시간",
      HOUR_2_TO_4: "2~4시간",
      HOUR_OVER_4: "4시간~",
    };
    return durationMap[duration as DayPlanScheduleDuration] ?? null;
  };

  const buildPayload = (values: TaskBasketFormModel, startAt: string, endAt: string) => {
    const basePayload: CreateDayPlanScheduleRequestDto = {
      title: values.content.trim(),
      type: values.isFixed ? "FIXED" : "FLEX",
    };

    if (values.isFixed) {
      return {
        ...basePayload,
        startAt,
        endAt,
      };
    }

    const flexPayload: CreateDayPlanScheduleRequestDto = {
      ...basePayload,
      estimatedTimeRange: mapDurationToApi(values.duration),
      focusLevel: values.immersion,
      isUrgent: values.isUrgent,
    };
    if (shouldShowTimeFields) {
      return {
        ...flexPayload,
        startAt,
        endAt,
      };
    }
    return flexPayload;
  };

  const buildTodoTask = (
    values: TaskBasketFormModel,
    startAt: string,
    endAt: string,
    response?: DayPlanScheduleItemDto,
  ): TodoTask => {
    if (response) {
      return {
        scheduleId: response.scheduleId,
        title: response.title,
        status: response.status,
        type: response.type,
        startAt: response.startAt,
        endAt: response.endAt,
        estimatedTimeRange: response.estimatedTimeRange,
        focusLevel: response.focusLevel,
        isUrgent: response.isUrgent,
        assignedBy: response.assignedBy,
      };
    }

    return {
      scheduleId: Date.now(),
      title: values.content.trim(),
      status: "TODO",
      type: values.isFixed ? "FIXED" : "FLEX",
      startAt,
      endAt,
      estimatedTimeRange: values.isFixed ? null : values.duration,
      focusLevel: values.isFixed ? null : values.immersion,
      isUrgent: values.isFixed ? null : values.isUrgent,
      assignedBy: "USER",
    };
  };

  const buildEditedTask = (
    values: TaskBasketFormModel,
    startAt: string,
    endAt: string,
    origin: TodoTask,
  ): TodoTask => ({
    scheduleId: origin.scheduleId,
    status: origin.status ?? "TODO",
    assignedBy: origin.assignedBy ?? "USER",
    title: values.content.trim(),
    type: values.isFixed ? "FIXED" : "FLEX",
    startAt,
    endAt,
    estimatedTimeRange: values.isFixed ? null : values.duration,
    focusLevel: values.isFixed ? null : values.immersion,
    isUrgent: values.isFixed ? null : values.isUrgent,
  });

  const handleFormSubmit = async (values: TaskBasketFormModel) => {
    if (!dayPlanId && !editingTask) {
      showToast("일정을 생성할 날짜 정보가 없습니다.", "error");
      return;
    }

    const shouldUseTime = values.isFixed || isAssignedFlexEditing || hasEditingTime;
    const startMinutes =
      shouldUseTime && values.startHour !== "" && values.startMinute !== ""
        ? Number(values.startHour) * 60 + Number(values.startMinute)
        : null;
    const endMinutes =
      shouldUseTime && values.endHour !== "" && values.endMinute !== ""
        ? Number(values.endHour) * 60 + Number(values.endMinute)
        : null;

    if (shouldUseTime && startMinutes !== null && endMinutes !== null) {
      if (hasTimeConflict(startMinutes, endMinutes)) {
        showToast("기존 시간에 다른 일정이 이미 존재합니다.", "error");
        return;
      }
    }

    const timeLabel = (value: number) => String(value).padStart(2, "0");
    const startAt =
      shouldUseTime && startMinutes !== null
        ? `${timeLabel(Number(values.startHour))}:${timeLabel(Number(values.startMinute))}`
        : "";
    const endAt =
      shouldUseTime && endMinutes !== null
        ? `${timeLabel(Number(values.endHour))}:${timeLabel(Number(values.endMinute))}`
        : "";

    const payload = buildPayload(values, startAt, endAt);

    try {
      if (editingTask) {
        await updateScheduleMutation.mutateAsync(payload);
        const nextTask = buildEditedTask(values, startAt, endAt, editingTask);
        onUpdateTask?.(nextTask);
        showToast("할 일이 수정되었습니다.", "success");
        handleClose();
        return;
      }
      await createScheduleMutation.mutateAsync(payload);
      showToast("할 일이 추가되었습니다.", "success");
      handleClose();
    } catch (error) {
      console.error(error);
    }
  };

  const form = useTaskBasketForm({
    onValid: handleFormSubmit,
  });

  const {
    register,
    reset,
    setValue,
    watch,
    formState: { errors },
    canSubmit,
    submitForm,
  } = form;

  const isFixed = watch("isFixed");
  const duration = watch("duration");
  const immersion = watch("immersion");
  const shouldShowTimeFields = isFixed || isAssignedFlexEditing || hasEditingTime || isEditMode;

  const dayEndTime = useUserPreferencesStore((state) => state.dayEndTime);
  const dayEndLimitMinutes = useMemo(() => {
    if (!dayEndTime) return null;
    const [hourText, minuteText] = dayEndTime.split(":");
    const hour = Number(hourText);
    const minute = Number(minuteText);
    if (Number.isNaN(hour) || Number.isNaN(minute)) return null;
    const total = hour * 60 + minute;
    if (total < 12 * 60) return null;
    return Math.floor(total / 10) * 10;
  }, [dayEndTime]);
  const dayEndHour = dayEndLimitMinutes !== null ? Math.floor(dayEndLimitMinutes / 60) : 23;
  const dayEndMinute = dayEndLimitMinutes !== null ? dayEndLimitMinutes % 60 : 50;
  const hourOptions = useMemo(() => {
    const startHour = 0;
    const endHour = Math.max(startHour, dayEndHour);
    return Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i);
  }, [dayEndHour]);
  const baseMinuteOptions = useMemo(() => [0, 10, 20, 30, 40, 50], []);
  const getMinuteOptions = useCallback(
    (hourValue: string) => {
      const hour = Number(hourValue);
      if (Number.isNaN(hour)) return baseMinuteOptions;
      if (dayEndLimitMinutes === null) return baseMinuteOptions;
      if (hour < dayEndHour) return baseMinuteOptions;
      if (hour === dayEndHour) {
        return baseMinuteOptions.filter((minute) => minute <= dayEndMinute);
      }
      return baseMinuteOptions;
    },
    [baseMinuteOptions, dayEndHour, dayEndLimitMinutes, dayEndMinute],
  );

  useEffect(() => {
    if (open) {
      if (editingTask) {
        const normalizeTimePart = (value: string) => {
          if (!value) return "";
          const parsed = Number(value);
          return Number.isNaN(parsed) ? "" : String(parsed);
        };
        const [startHourRaw = "", startMinuteRaw = ""] = editingTask.startAt?.split(":") ?? [];
        const [endHourRaw = "", endMinuteRaw = ""] = editingTask.endAt?.split(":") ?? [];
        const startHour = normalizeTimePart(startHourRaw);
        const startMinute = normalizeTimePart(startMinuteRaw);
        const endHour = normalizeTimePart(endHourRaw);
        const endMinute = normalizeTimePart(endMinuteRaw);
        reset(
          {
            content: editingTask.title ?? "",
            isFixed: editingTask.type === "FIXED",
            startHour,
            startMinute,
            endHour,
            endMinute,
            duration: mapDurationFromApi(
              editingTask.estimatedTimeRange as DayPlanScheduleDuration | TaskDurationOption | null,
            ),
            immersion: editingTask.focusLevel ?? 5,
            isUrgent: Boolean(editingTask.isUrgent),
          },
          { keepDirty: false },
        );
      } else {
        reset(TASK_BASKET_FORM_DEFAULTS);
      }
      setIsExpanded(true);
      return;
    }
    reset(TASK_BASKET_FORM_DEFAULTS);
  }, [editingTask, open, reset]);

  const handleSheetOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      handleClose();
      return;
    }
    onOpenChange(true);
  };

  return (
    <>
      <BottomSheet
        open={open}
        onOpenChange={handleSheetOpenChange}
        expanded={isExpanded}
        onExpandedChange={setIsExpanded}
        peekHeight={85}
        expandHeight={90}
        enableDragHandle
        className="z-[99] pb-[env(safe-area-inset-bottom)]"
        sheetClassName="z-[99]"
      >
        <div className="flex h-full flex-col px-6">
          <h2 className="text-2xl font-semibold text-neutral-900">
            {isEditMode ? "할 일 수정" : "할 일"}
          </h2>

          <form
            className="scrollbar-hide mt-6 flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto pb-8"
            onSubmit={submitForm}
          >
            <FormField
              label="할 일 내용"
              error={errors.content?.message}
            >
              <input
                type="text"
                placeholder="스크럼 시간"
                className={BASE_INPUT_CLASS_NAME}
                {...register("content")}
                maxLength={25}
              />
            </FormField>

            <div className="flex flex-col gap-3">
              <label className="flex items-center gap-2 text-sm font-semibold text-neutral-900">
                <input
                  type="checkbox"
                  className="h-5 w-5 rounded border-neutral-300 text-neutral-900"
                  {...register("isFixed")}
                />
                고정 시간
              </label>

              {!isFixed && !isAssignedFlexEditing && (
                <div className="rounded-2xl bg-neutral-100 px-4 py-3 text-sm text-[var(--color-ink-300)]">
                  고정 시간이 지정되어있지 않을 경우, AI가 잘 맞는 시간대로 배치합니다!
                </div>
              )}

              {shouldShowTimeFields && (
                <div className="flex flex-col gap-2">
                  {(isAssignedFlexEditing || hasEditingTime) && !isFixed ? (
                    <div className="text-sm font-semibold text-neutral-900">배치 시간</div>
                  ) : null}
                  <div className="flex items-center justify-between gap-3 text-base font-semibold text-neutral-900">
                    <TimeSelect
                      label="시작 시간"
                      hourOptions={hourOptions}
                      minuteOptions={getMinuteOptions(watch("startHour"))}
                      hourValue={watch("startHour")}
                      minuteValue={watch("startMinute")}
                      onHourChange={(value) =>
                        setValue("startHour", value, {
                          shouldValidate: true,
                        })
                      }
                      onMinuteChange={(value) =>
                        setValue("startMinute", value, {
                          shouldValidate: true,
                        })
                      }
                    />
                    <span className="text-neutral-400">—</span>
                    <TimeSelect
                      label="종료 시간"
                      hourOptions={hourOptions}
                      minuteOptions={getMinuteOptions(watch("endHour"))}
                      hourValue={watch("endHour")}
                      minuteValue={watch("endMinute")}
                      onHourChange={(value) =>
                        setValue("endHour", value, {
                          shouldValidate: true,
                        })
                      }
                      onMinuteChange={(value) =>
                        setValue("endMinute", value, {
                          shouldValidate: true,
                        })
                      }
                    />
                  </div>
                </div>
              )}
            </div>

            {!isFixed && (
              <>
                <div className="flex flex-col gap-3">
                  <div className="text-sm font-semibold text-neutral-900">예상 소요 시간</div>
                  <div className="flex flex-wrap gap-3 text-center text-[var(--color-gray-300)]">
                    {TASK_DURATION_OPTIONS.map((option) => {
                      const isSelected = duration === option;
                      return (
                        <button
                          key={option}
                          type="button"
                          className={`rounded-full px-4 py-2 text-sm font-semibold ${
                            isSelected
                              ? "bg-neutral-900 text-white"
                              : "bg-neutral-100 text-neutral-700"
                          }`}
                          onClick={() =>
                            setValue("duration", option, {
                              shouldValidate: true,
                              shouldDirty: true,
                            })
                          }
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                  {errors.duration?.message && (
                    <p className="text-xs text-[var(--color-red-400)]">
                      {errors.duration?.message}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <div className="text-base font-semibold text-neutral-900">몰입도</div>
                    <div className="text-sm font-semibold text-neutral-900">{immersion}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-neutral-400">1</span>
                    <input
                      type="range"
                      min={1}
                      max={10}
                      value={immersion}
                      {...register("immersion", { valueAsNumber: true })}
                      className="h-2 w-full accent-[rgba(229,148,148,1)]"
                    />
                    <span className="text-sm text-neutral-400">10</span>
                  </div>
                </div>

                <label className="flex items-center gap-2 text-base font-semibold text-neutral-900">
                  <input
                    type="checkbox"
                    className="h-5 w-5 rounded border-neutral-300 text-neutral-900"
                    {...register("isUrgent")}
                  />
                  급해요
                </label>
              </>
            )}

            <PrimaryButton
              type="submit"
              className="mt-2 w-full rounded-[28px]"
              disabled={!canSubmit}
            >
              {isEditMode ? "수정하기" : "할 일 추가"}
            </PrimaryButton>
          </form>
        </div>
      </BottomSheet>
    </>
  );
}

interface TimeSelectProps {
  label: string;
  hourOptions: number[];
  minuteOptions: number[];
  hourValue: string;
  minuteValue: string;
  onHourChange: (value: string) => void;
  onMinuteChange: (value: string) => void;
}

function TimeSelect({
  label,
  hourOptions,
  minuteOptions,
  hourValue,
  minuteValue,
  onHourChange,
  onMinuteChange,
}: TimeSelectProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="sr-only">{label}</span>
      <select
        className="h-11 rounded-xl border border-neutral-200 bg-neutral-50 px-3 text-sm text-neutral-900"
        value={hourValue}
        onChange={(event) => onHourChange(event.target.value)}
      >
        <option value="">시</option>
        {hourOptions.map((hour) => (
          <option
            key={hour}
            value={hour}
          >
            {hour}시
          </option>
        ))}
      </select>
      <select
        className="h-11 rounded-xl border border-neutral-200 bg-neutral-50 px-3 text-sm text-neutral-900"
        value={minuteValue}
        onChange={(event) => onMinuteChange(event.target.value)}
      >
        <option value="">분</option>
        {minuteOptions.map((minute) => (
          <option
            key={minute}
            value={minute}
          >
            {minute}분
          </option>
        ))}
      </select>
    </div>
  );
}
