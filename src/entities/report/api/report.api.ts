import { apiFetch, Endpoint } from "@/shared/api";
import { AuthService } from "@/shared/auth";

import type { WeeklyReportDto } from "./types";

interface FetchWeeklyReportParams {
  startDate: string;
  signal?: AbortSignal;
}

export async function fetchWeeklyReport({
  startDate,
  signal,
}: FetchWeeklyReportParams): Promise<WeeklyReportDto> {
  const searchParams = new URLSearchParams({ startDate });

  return AuthService.refreshAndRetry(() =>
    apiFetch<WeeklyReportDto>(`${Endpoint.REPORTS.LIST}?${searchParams.toString()}`, {
      signal,
      authRequired: true,
    }),
  );
}
