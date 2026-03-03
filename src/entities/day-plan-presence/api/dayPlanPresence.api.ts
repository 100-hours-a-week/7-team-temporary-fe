import { apiFetch, Endpoint } from "@/shared/api";
import { AuthService } from "@/shared/auth";

import type { DayPlanPeriodSchedulesResponseDto } from "./types";

interface FetchDayPlanPeriodSchedulesParams {
  startDate: string;
  endDate: string;
  signal?: AbortSignal;
}

export async function fetchDayPlanPeriodSchedules({
  startDate,
  endDate,
  signal,
}: FetchDayPlanPeriodSchedulesParams): Promise<DayPlanPeriodSchedulesResponseDto> {
  const searchParams = new URLSearchParams({
    startDate,
    endDate,
  });

  return AuthService.refreshAndRetry(() =>
    apiFetch<DayPlanPeriodSchedulesResponseDto>(
      `${Endpoint.DAY_PLAN.PERIOD_SCHEDULES}?${searchParams.toString()}`,
      {
        signal,
        authRequired: true,
      },
    ),
  );
}
