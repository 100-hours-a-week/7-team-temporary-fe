import { Endpoint } from "@/shared/api";
import { useApiMutation } from "@/shared/query";

type DayPlanScheduleStatus = "TODO" | "DONE";

export interface UpdateScheduleStatusPayload {
  scheduleId: number;
  status: DayPlanScheduleStatus;
}

export type ScheduleChildrenPayload = {
  schedules: Array<{
    parentScheduleId: number;
    titles: string[];
  }>;
};

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
