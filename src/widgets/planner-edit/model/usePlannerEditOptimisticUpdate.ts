"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  dayPlanQueryKeys,
  type DayPlanScheduleResponseDto,
  type EditableTaskItemModel,
  type UpdateDayPlanSchedulePatchRequestDto,
  updateDayPlanSchedule,
} from "@/entities/day-plan";

import { removeScheduleCache, updateScheduleCache } from "../lib/scheduleCache";

type UsePlannerEditOptimisticUpdateParams = {
  dayPlanId: number | null;
  scheduleKeys: readonly (readonly unknown[])[];
  captureScrollPosition: () => void;
  restoreScrollPosition: () => void;
};

type PlannerEditScheduleUpdateVariables = {
  scheduleId: number;
  payload: UpdateDayPlanSchedulePatchRequestDto;
  task: EditableTaskItemModel;
};

type PlannerEditScheduleUpdateContext = {
  prevSchedules: Array<readonly [readonly unknown[], DayPlanScheduleResponseDto | undefined]>;
  prevExcluded: DayPlanScheduleResponseDto | undefined;
};

export function usePlannerEditOptimisticUpdate({
  dayPlanId,
  scheduleKeys,
  captureScrollPosition,
  restoreScrollPosition,
}: UsePlannerEditOptimisticUpdateParams) {
  const queryClient = useQueryClient();

  return useMutation<
    void,
    Error,
    PlannerEditScheduleUpdateVariables,
    PlannerEditScheduleUpdateContext | undefined
  >({
    mutationFn: async (variables) => updateDayPlanSchedule(variables.scheduleId, variables.payload),
    onMutate: async (variables) => {
      captureScrollPosition();
      if (!dayPlanId || scheduleKeys.length === 0) return undefined;

      const excludedKey = dayPlanQueryKeys.dayPlanSchedulesById(dayPlanId, "EXCLUDED", 1, 10);
      const prevSchedules = scheduleKeys.map((key) => [
        key,
        queryClient.getQueryData<DayPlanScheduleResponseDto>(key),
      ]) as Array<readonly [readonly unknown[], DayPlanScheduleResponseDto | undefined]>;
      const prevExcluded = queryClient.getQueryData<DayPlanScheduleResponseDto>(excludedKey);

      scheduleKeys.forEach((key) => {
        queryClient.setQueryData(key, (prev: DayPlanScheduleResponseDto | undefined) =>
          updateScheduleCache(
            prev,
            variables.scheduleId,
            variables.payload.startAt,
            variables.payload.endAt,
            variables.task,
          ),
        );
      });
      queryClient.setQueryData(excludedKey, (prev: DayPlanScheduleResponseDto | undefined) =>
        removeScheduleCache(prev, variables.scheduleId),
      );

      requestAnimationFrame(() => {
        restoreScrollPosition();
      });

      return { prevSchedules, prevExcluded };
    },
    onError: (_error, _variables, context) => {
      if (!dayPlanId || !context) return;
      const excludedKey = dayPlanQueryKeys.dayPlanSchedulesById(dayPlanId, "EXCLUDED", 1, 10);

      context.prevSchedules.forEach(([key, prev]) => {
        queryClient.setQueryData(key, prev);
      });
      queryClient.setQueryData(excludedKey, context.prevExcluded);

      requestAnimationFrame(() => {
        restoreScrollPosition();
      });
    },
    onSuccess: () => {
      requestAnimationFrame(() => {
        restoreScrollPosition();
      });
    },
  });
}
