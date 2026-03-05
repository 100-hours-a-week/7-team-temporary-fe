import { Endpoint } from "@/shared/api";
import { useApiMutation } from "@/shared/query";

export type ScheduleChildrenPayload = {
  schedules: Array<{
    parentScheduleId: number;
    titles: string[];
  }>;
};

type DayPlanScheduleStatus = "TODO" | "DONE";

export interface UpdateScheduleStatusPayload {
  scheduleId: number;
  status: DayPlanScheduleStatus;
}

interface UseScheduleMutationBaseOptions {
  invalidateKeys?: Array<readonly unknown[]>;
}

export function useDeleteScheduleMutation({
  invalidateKeys = [],
}: UseScheduleMutationBaseOptions = {}) {
  return useApiMutation<number, void, void>({
    url: (scheduleId) => Endpoint.SCHEDULE.BY_ID(scheduleId),
    method: "DELETE",
    authRequired: true,
    refreshOnUnauthorized: true,
    invalidateKeys,
  });
}

export function useUpdateScheduleStatusMutation({
  invalidateKeys = [],
}: UseScheduleMutationBaseOptions = {}) {
  return useApiMutation<UpdateScheduleStatusPayload, { status: DayPlanScheduleStatus }, void>({
    url: ({ scheduleId }) => Endpoint.SCHEDULE.STATUS(scheduleId),
    method: "PATCH",
    authRequired: true,
    refreshOnUnauthorized: true,
    dtoFn: ({ status }) => ({ status }),
    invalidateKeys,
  });
}

interface UseAiArrangeScheduleMutationOptions extends UseScheduleMutationBaseOptions {
  dayPlanId: number | null;
}

export function useAiArrangeScheduleMutation({
  dayPlanId,
  invalidateKeys = [],
}: UseAiArrangeScheduleMutationOptions) {
  return useApiMutation<void, void, void>({
    url: () => {
      if (!dayPlanId) {
        throw new Error("dayPlanId가 없습니다.");
      }
      return Endpoint.DAY_PLAN.AI_ARRANGEMENT(dayPlanId);
    },
    method: "POST",
    authRequired: true,
    refreshOnUnauthorized: true,
    invalidateKeys,
  });
}

interface UseScheduleChildrenMutationOptions extends UseScheduleMutationBaseOptions {
  onSuccess?: () => void;
}

export function useScheduleChildrenMutation({
  invalidateKeys = [],
  onSuccess,
}: UseScheduleChildrenMutationOptions = {}) {
  return useApiMutation<ScheduleChildrenPayload, ScheduleChildrenPayload, void>({
    url: Endpoint.SCHEDULE.CHILDREN,
    method: "POST",
    authRequired: true,
    refreshOnUnauthorized: true,
    dtoFn: (payload) => payload,
    invalidateKeys,
    onSuccess: () => {
      onSuccess?.();
    },
  });
}
