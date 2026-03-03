import type {
  DayPlanScheduleCreatePayload,
  TodoCartTaskItemModel,
} from "@/entities/day-plan-schedule";
import { Endpoint } from "@/shared/api";
import { useApiMutation } from "@/shared/query";

interface UseTaskBasketScheduleMutationsParams {
  dayPlanId: number | null;
  editingTask?: TodoCartTaskItemModel | null;
  invalidateKeys?: Array<readonly unknown[]>;
}

export function useTaskBasketScheduleMutations({
  dayPlanId,
  editingTask,
  invalidateKeys,
}: UseTaskBasketScheduleMutationsParams) {
  const createScheduleMutation = useApiMutation<
    DayPlanScheduleCreatePayload,
    DayPlanScheduleCreatePayload,
    void
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
    DayPlanScheduleCreatePayload,
    DayPlanScheduleCreatePayload,
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

  return {
    createScheduleMutation,
    updateScheduleMutation,
  };
}
