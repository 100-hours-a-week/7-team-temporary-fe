import { apiFetch, Endpoint } from "@/shared/api";
import { AuthService } from "@/shared/auth";

interface FetchDayPlanReflectionStatusParams {
  dayPlanId: number;
  signal?: AbortSignal;
}

export async function fetchDayPlanReflectionStatus({
  dayPlanId,
  signal,
}: FetchDayPlanReflectionStatusParams): Promise<{ alreadyWrote: boolean }> {
  return AuthService.refreshAndRetry(() =>
    apiFetch<{ alreadyWrote: boolean }>(Endpoint.DAY_PLAN.REFLECTION(dayPlanId), {
      signal,
      authRequired: true,
    }),
  );
}
