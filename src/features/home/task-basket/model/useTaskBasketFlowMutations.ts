"use client";

import {
  useAiArrangeScheduleMutation,
  useDeleteScheduleMutation,
  useScheduleChildrenMutation,
} from "../../model/useScheduleMutations";
import type { InvalidateScheduleKeys } from "./useTaskBasketScheduleListQuery";

interface UseTaskBasketFlowMutationsParams {
  dayPlanId: number | null;
  invalidateScheduleKeys: InvalidateScheduleKeys;
}

export function useTaskBasketFlowMutations({
  dayPlanId,
  invalidateScheduleKeys,
}: UseTaskBasketFlowMutationsParams) {
  const deleteScheduleMutation = useDeleteScheduleMutation({
    invalidateKeys: invalidateScheduleKeys,
  });

  const aiArrangeMutation = useAiArrangeScheduleMutation({
    dayPlanId,
    invalidateKeys: invalidateScheduleKeys,
  });

  const scheduleChildrenMutation = useScheduleChildrenMutation({
    invalidateKeys: invalidateScheduleKeys,
  });

  return {
    deleteScheduleMutation,
    aiArrangeMutation,
    scheduleChildrenMutation,
  };
}
