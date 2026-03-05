import { apiFetch, Endpoint } from "@/shared/api";
import { AuthService } from "@/shared/auth";

import type { ReportMessageListDto, WeeklyReportDto } from "./types";

interface FetchWeeklyReportParams {
  startDate: string;
  signal?: AbortSignal;
}

interface FetchReportMessagesParams {
  reportId: number;
  cursor?: number;
  size?: number;
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

export async function fetchReportMessages({
  reportId,
  cursor,
  size = 5,
  signal,
}: FetchReportMessagesParams): Promise<ReportMessageListDto> {
  const searchParams = new URLSearchParams({ size: String(size) });
  if (typeof cursor === "number") {
    searchParams.set("cursor", String(cursor));
  }

  return AuthService.refreshAndRetry(() =>
    apiFetch<ReportMessageListDto>(
      `${Endpoint.REPORTS.MESSAGES(reportId)}?${searchParams.toString()}`,
      {
        signal,
        authRequired: true,
      },
    ),
  );
}
