"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  dayPlanScheduleQueryKeys,
  type DayPlanScheduleListModel,
  type DayPlanSchedulePatchModel,
  type EditableTaskItemModel,
  patchDayPlanSchedule,
} from "@/entities/day-plan-schedule";

import { removeScheduleCache, updateScheduleCache } from "../lib/scheduleCache";

type UsePlannerEditOptimisticUpdateParams = {
  dayPlanId: number | null;
  scheduleKeys: readonly (readonly unknown[])[];
  captureScrollPosition: () => void;
  restoreScrollPosition: () => void;
};

type PlannerEditScheduleUpdateVariables = {
  scheduleId: number;
  payload: DayPlanSchedulePatchModel;
  task: EditableTaskItemModel;
};

type PlannerEditScheduleUpdateContext = {
  prevSchedules: Array<readonly [readonly unknown[], DayPlanScheduleListModel | undefined]>;
  prevExcluded: DayPlanScheduleListModel | undefined;
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
    mutationFn: async (variables) => patchDayPlanSchedule(variables.scheduleId, variables.payload),
    onMutate: async (variables) => {
      captureScrollPosition();
      if (!dayPlanId || scheduleKeys.length === 0) return undefined;

      const excludedKey = dayPlanScheduleQueryKeys.dayPlanSchedulesById(
        dayPlanId,
        "EXCLUDED",
        1,
        10,
      );
      const prevSchedules = scheduleKeys.map((key) => [
        key,
        queryClient.getQueryData<DayPlanScheduleListModel>(key),
      ]) as Array<readonly [readonly unknown[], DayPlanScheduleListModel | undefined]>;
      const prevExcluded = queryClient.getQueryData<DayPlanScheduleListModel>(excludedKey);

      scheduleKeys.forEach((key) => {
        queryClient.setQueryData(key, (prev: DayPlanScheduleListModel | undefined) =>
          updateScheduleCache(
            prev,
            variables.scheduleId,
            variables.payload.startAt,
            variables.payload.endAt,
            variables.task,
          ),
        );
      });
      queryClient.setQueryData(excludedKey, (prev: DayPlanScheduleListModel | undefined) =>
        removeScheduleCache(prev, variables.scheduleId),
      );

      requestAnimationFrame(() => {
        restoreScrollPosition();
      });

      return { prevSchedules, prevExcluded };
    },
    onError: (_error, _variables, context) => {
      if (!dayPlanId || !context) return;
      const excludedKey = dayPlanScheduleQueryKeys.dayPlanSchedulesById(
        dayPlanId,
        "EXCLUDED",
        1,
        10,
      );

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
