"use client";

import { useEffect, useMemo, useState } from "react";

import type { TodoCartTaskItemModel } from "@/features/home/model/taskModels";
import {
  TASK_BASKET_FORM_DEFAULTS,
  useTaskBasketForm,
  type TaskBasketFormModel,
} from "@/features/home/task-basket/model";
import { TASK_DURATION_OPTIONS } from "@/shared/validation";
import { BottomSheet } from "@/shared/ui";
import { FormField, BASE_INPUT_CLASS_NAME } from "@/shared/form/ui";
import { PrimaryButton } from "@/shared/ui/button";
import { useToast } from "@/shared/ui/toast";

type TodoTask = TodoCartTaskItemModel & { status?: "TODO" | "DONE" };

interface TaskBasketAddSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tasks: TodoTask[];
  onAddTask: (task: TodoTask) => void;
}

export function TaskBasketAddSheet({
  open,
  onOpenChange,
  tasks,
  onAddTask,
}: TaskBasketAddSheetProps) {
  const { showToast } = useToast();
  const [isExpanded, setIsExpanded] = useState(true);

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

  const handleFormSubmit = (values: TaskBasketFormModel) => {
    const startMinutes =
      values.isFixed && values.startHour !== "" && values.startMinute !== ""
        ? Number(values.startHour) * 60 + Number(values.startMinute)
        : null;
    const endMinutes =
      values.isFixed && values.endHour !== "" && values.endMinute !== ""
        ? Number(values.endHour) * 60 + Number(values.endMinute)
        : null;

    if (values.isFixed && startMinutes !== null && endMinutes !== null) {
      if (hasTimeConflict(startMinutes, endMinutes)) {
        showToast("기존 시간에 다른 일정이 이미 존재합니다.", "error");
        return;
      }
    }

    const scheduleId = Date.now();
    const timeLabel = (value: number) => String(value).padStart(2, "0");
    const startAt =
      values.isFixed && startMinutes !== null
        ? `${timeLabel(Number(values.startHour))}:${timeLabel(Number(values.startMinute))}`
        : "";
    const endAt =
      values.isFixed && endMinutes !== null
        ? `${timeLabel(Number(values.endHour))}:${timeLabel(Number(values.endMinute))}`
        : "";

    const nextTask: TodoTask = {
      scheduleId,
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

    onAddTask(nextTask);
    showToast("할 일이 추가되었습니다.", "success");
    handleClose();
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

  const hourOptions = useMemo(() => Array.from({ length: 24 }, (_, i) => i), []);
  const minuteOptions = useMemo(() => Array.from({ length: 60 }, (_, i) => i), []);

  useEffect(() => {
    if (open) {
      reset(TASK_BASKET_FORM_DEFAULTS);
      setIsExpanded(true);
      return;
    }
    reset(TASK_BASKET_FORM_DEFAULTS);
  }, [open, reset]);

  const handleSheetOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      handleClose();
      return;
    }
    onOpenChange(true);
  };

  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="할 일 추가 바텀 시트 닫기"
          className="fixed inset-0 z-30 bg-black/50"
          onClick={handleClose}
        />
      )}

      <BottomSheet
        open={open}
        onOpenChange={handleSheetOpenChange}
        expanded={isExpanded}
        onExpandedChange={setIsExpanded}
        peekHeight={85}
        expandHeight={90}
        enableDragHandle
        className="pb-[env(safe-area-inset-bottom)]"
      >
        <div className="px-6 pb-8">
          <h2 className="text-2xl font-semibold text-neutral-900">할 일</h2>

          <form
            className="mt-6 flex flex-col gap-6"
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
              <label className="flex items-center gap-2 text-base font-semibold text-neutral-900">
                <input
                  type="checkbox"
                  className="h-5 w-5 rounded border-neutral-300 text-neutral-900"
                  {...register("isFixed")}
                />
                고정 시간
              </label>

              {!isFixed && (
                <div className="rounded-2xl bg-neutral-100 px-4 py-3 text-sm text-neutral-500">
                  고정 시간이 지정되어있지 않을 경우, AI가 여러분에게 잘 맞는 시간대로 배치합니다!
                </div>
              )}

              {isFixed && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-3 text-base font-semibold text-neutral-900">
                    <TimeSelect
                      label="시작 시간"
                      hourOptions={hourOptions}
                      minuteOptions={minuteOptions}
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
                      minuteOptions={minuteOptions}
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
                  {errors.startHour?.message && (
                    <p className="text-xs text-[var(--color-red-400)]">
                      {errors.startHour?.message}
                    </p>
                  )}
                </div>
              )}
            </div>

            {!isFixed && (
              <>
                <div className="flex flex-col gap-3">
                  <div className="text-base font-semibold text-neutral-900">예상 소요 시간</div>
                  <div className="flex flex-wrap gap-3">
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
                  <div className="text-base font-semibold text-neutral-900">몰입도</div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-neutral-400">1</span>
                    <input
                      type="range"
                      min={1}
                      max={10}
                      value={immersion}
                      {...register("immersion", { valueAsNumber: true })}
                      className="h-2 w-full accent-neutral-900"
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
              할 일 추가
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
