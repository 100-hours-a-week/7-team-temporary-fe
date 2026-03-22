"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import type { TodoCartTaskItemModel } from "@/entities/day-plan-schedule";
import { TASK_BASKET_FORM_DEFAULTS, useTaskBasketForm, type TaskBasketFormModel } from "../model";
import { parseHHmmToMinutes } from "@/shared/lib";
import { useMutationErrorEffect } from "@/shared/query";
import { BottomSheet } from "@/shared/ui/bottom-sheet/bottom-sheet";
import { FormField, BASE_INPUT_CLASS_NAME } from "@/shared/form/ui";
import { PrimaryButton } from "@/shared/ui/button/primary";
import { useToast } from "@/shared/ui/toast";
import { useUserPreferencesStore } from "@/entities/user";
import {
  toCreateDayPlanScheduleRequestDto,
  toTaskBasketFormModelFromTask,
  toTaskBasketTimeRange,
  useTaskBasketScheduleMutations,
} from "../model";
import { TaskDurationOptionList } from "./TaskDurationOptionList";
import { TaskTimeSelectList } from "./TaskTimeSelectList";
import {
  TASK_BASKET_AI_TIME_HINT,
  TASK_BASKET_CONTENT_LABEL,
  TASK_BASKET_CONTENT_MAX_LENGTH,
  TASK_BASKET_CONTENT_PLACEHOLDER,
  TASK_BASKET_CREATE_SUBMIT_LABEL,
  TASK_BASKET_CREATE_SUCCESS_MESSAGE,
  TASK_BASKET_CREATE_TITLE,
  TASK_BASKET_DAY_END_MIN_THRESHOLD,
  TASK_BASKET_DEFAULT_DAY_END_HOUR,
  TASK_BASKET_DEFAULT_DAY_END_MINUTE,
  TASK_BASKET_EDIT_SUBMIT_LABEL,
  TASK_BASKET_EDIT_TITLE,
  TASK_BASKET_FIXED_TIME_LABEL,
  TASK_BASKET_IMMERSION_LABEL,
  TASK_BASKET_MINUTE_OPTIONS,
  TASK_BASKET_NO_DAY_PLAN_MESSAGE,
  TASK_BASKET_SHEET_EXPAND_HEIGHT,
  TASK_BASKET_SHEET_PEEK_HEIGHT,
  TASK_BASKET_TIME_CONFLICT_MESSAGE,
  TASK_BASKET_UPDATE_SUCCESS_MESSAGE,
  TASK_BASKET_URGENT_LABEL,
  TASK_BASKET_VALIDATE_DIRTY_OPTIONS,
  TASK_BASKET_VALIDATE_OPTIONS,
} from "./TaskBasketAddSheet.constants";

type TodoTask = TodoCartTaskItemModel & { status?: "TODO" | "DONE" };

interface TaskBasketAddSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tasks: TodoTask[];
  dayPlanId: number | null;
  invalidateKeys?: Array<readonly unknown[]>;
  editingTask?: TodoTask | null;
  onUpdateTask?: (task: TodoTask) => void;
}

export function TaskBasketAddSheet({
  open,
  onOpenChange,
  tasks,
  dayPlanId,
  invalidateKeys,
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
      const taskStart = parseHHmmToMinutes(task.startAt);
      const taskEnd = parseHHmmToMinutes(task.endAt);
      if (taskStart === null || taskEnd === null) return false;
      return newStart < taskEnd && newEnd > taskStart;
    });

  const handleClose = () => {
    onOpenChange(false);
  };

  const { createScheduleMutation, updateScheduleMutation } = useTaskBasketScheduleMutations({
    dayPlanId,
    editingTask,
    invalidateKeys,
  });
  useMutationErrorEffect(createScheduleMutation);
  useMutationErrorEffect(updateScheduleMutation);

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
      showToast(TASK_BASKET_NO_DAY_PLAN_MESSAGE, "error");
      return;
    }

    const shouldUseTime = values.isFixed || isAssignedFlexEditing || hasEditingTime;
    const { startMinutes, endMinutes, startAt, endAt } = toTaskBasketTimeRange(
      values,
      shouldUseTime,
    );

    if (shouldUseTime && startMinutes !== null && endMinutes !== null) {
      if (hasTimeConflict(startMinutes, endMinutes)) {
        showToast(TASK_BASKET_TIME_CONFLICT_MESSAGE, "error");
        return;
      }
    }

    const payload = toCreateDayPlanScheduleRequestDto({
      form: values,
      shouldShowTimeFields,
      startAt,
      endAt,
    });

    try {
      if (editingTask) {
        await updateScheduleMutation.mutateAsync(payload);
        const nextTask = buildEditedTask(values, startAt, endAt, editingTask);
        onUpdateTask?.(nextTask);
        showToast(TASK_BASKET_UPDATE_SUCCESS_MESSAGE, "success");
        handleClose();
        return;
      }
      await createScheduleMutation.mutateAsync(payload);
      showToast(TASK_BASKET_CREATE_SUCCESS_MESSAGE, "success");
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
    const total = parseHHmmToMinutes(dayEndTime);
    if (total === null) return null;
    if (total < TASK_BASKET_DAY_END_MIN_THRESHOLD) return null;
    return Math.floor(total / 10) * 10;
  }, [dayEndTime]);
  const dayEndHour =
    dayEndLimitMinutes !== null
      ? Math.floor(dayEndLimitMinutes / 60)
      : TASK_BASKET_DEFAULT_DAY_END_HOUR;
  const dayEndMinute =
    dayEndLimitMinutes !== null ? dayEndLimitMinutes % 60 : TASK_BASKET_DEFAULT_DAY_END_MINUTE;
  const hourOptions = useMemo(() => {
    const startHour = 0;
    const endHour = Math.max(startHour, dayEndHour);
    return Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i);
  }, [dayEndHour]);
  const baseMinuteOptions = useMemo(() => [...TASK_BASKET_MINUTE_OPTIONS], []);
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
        reset(toTaskBasketFormModelFromTask(editingTask), { keepDirty: false });
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
        peekHeight={TASK_BASKET_SHEET_PEEK_HEIGHT}
        expandHeight={TASK_BASKET_SHEET_EXPAND_HEIGHT}
        enableDragHandle
        className="z-[99] pb-[env(safe-area-inset-bottom)]"
        sheetClassName="z-[99]"
      >
        <div className="flex h-full flex-col px-6">
          <h2 className="text-2xl font-semibold text-neutral-900">
            {isEditMode ? TASK_BASKET_EDIT_TITLE : TASK_BASKET_CREATE_TITLE}
          </h2>

          <form
            className="scrollbar-hide mt-6 flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto pb-8"
            onSubmit={submitForm}
          >
            <FormField
              label={TASK_BASKET_CONTENT_LABEL}
              error={errors.content?.message}
            >
              <input
                type="text"
                placeholder={TASK_BASKET_CONTENT_PLACEHOLDER}
                className={BASE_INPUT_CLASS_NAME}
                {...register("content")}
                maxLength={TASK_BASKET_CONTENT_MAX_LENGTH}
              />
            </FormField>

            <div className="flex flex-col gap-3">
              <label className="flex items-center gap-2 text-sm font-semibold text-neutral-900">
                <input
                  type="checkbox"
                  className="h-5 w-5 rounded border-neutral-300 text-neutral-900"
                  {...register("isFixed")}
                />
                {TASK_BASKET_FIXED_TIME_LABEL}
              </label>

              {!isFixed && !isAssignedFlexEditing && (
                <div className="rounded-2xl bg-neutral-100 px-4 py-3 text-sm text-[var(--color-ink-300)]">
                  {TASK_BASKET_AI_TIME_HINT}
                </div>
              )}

              {shouldShowTimeFields && (
                <TaskTimeSelectList
                  showArrangedLabel={(isAssignedFlexEditing || hasEditingTime) && !isFixed}
                  start={{
                    hourOptions,
                    minuteOptions: getMinuteOptions(watch("startHour")),
                    hourValue: watch("startHour"),
                    minuteValue: watch("startMinute"),
                    onHourChange: (value) =>
                      setValue("startHour", value, TASK_BASKET_VALIDATE_OPTIONS),
                    onMinuteChange: (value) =>
                      setValue("startMinute", value, TASK_BASKET_VALIDATE_OPTIONS),
                  }}
                  end={{
                    hourOptions,
                    minuteOptions: getMinuteOptions(watch("endHour")),
                    hourValue: watch("endHour"),
                    minuteValue: watch("endMinute"),
                    onHourChange: (value) =>
                      setValue("endHour", value, TASK_BASKET_VALIDATE_OPTIONS),
                    onMinuteChange: (value) =>
                      setValue("endMinute", value, TASK_BASKET_VALIDATE_OPTIONS),
                  }}
                />
              )}
            </div>

            {!isFixed && (
              <>
                <TaskDurationOptionList
                  value={duration}
                  errorMessage={errors.duration?.message}
                  onChange={(option) =>
                    setValue("duration", option, TASK_BASKET_VALIDATE_DIRTY_OPTIONS)
                  }
                />

                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <div className="text-base font-semibold text-neutral-900">
                      {TASK_BASKET_IMMERSION_LABEL}
                    </div>
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
                  {TASK_BASKET_URGENT_LABEL}
                </label>
              </>
            )}

            <PrimaryButton
              type="submit"
              className="mt-2 w-full rounded-[28px]"
              disabled={!canSubmit}
            >
              {isEditMode ? TASK_BASKET_EDIT_SUBMIT_LABEL : TASK_BASKET_CREATE_SUBMIT_LABEL}
            </PrimaryButton>
          </form>
        </div>
      </BottomSheet>
    </>
  );
}
