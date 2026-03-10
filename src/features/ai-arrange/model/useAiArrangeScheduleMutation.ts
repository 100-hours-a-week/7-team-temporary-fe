import { Endpoint } from "@/shared/api";
import { useApiMutation } from "@/shared/query";

interface UseAiArrangeScheduleMutationOptions {
  dayPlanId: number | null;
  invalidateKeys?: Array<readonly unknown[]>;
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
