import { apiFetch, Endpoint } from "@/shared/api";
import { AuthService } from "@/shared/auth";

import type {
  CreateDayPlanScheduleRequestDto,
  DayPlanScheduleItemDto,
  DayPlanScheduleResponseDto,
} from "./types";

interface FetchDayPlanScheduleParams {
  date: string;
  page?: number;
  size?: number;
  signal?: AbortSignal;
}

export async function fetchDayPlanSchedule({
  date,
  page = 1,
  size = 10,
  signal,
}: FetchDayPlanScheduleParams): Promise<DayPlanScheduleResponseDto> {
  const searchParams = new URLSearchParams({
    date,
    page: String(page),
    size: String(size),
  });

  return AuthService.refreshAndRetry(() =>
    apiFetch<DayPlanScheduleResponseDto>(
      `${Endpoint.DAY_PLAN.SCHEDULE}?${searchParams.toString()}`,
      {
        signal,
        authRequired: true,
      },
    ),
  );
}

export async function createDayPlanSchedule(
  dayPlanId: number,
  payload: CreateDayPlanScheduleRequestDto,
): Promise<DayPlanScheduleItemDto | undefined> {
  return AuthService.refreshAndRetry(() =>
    apiFetch<DayPlanScheduleItemDto, CreateDayPlanScheduleRequestDto>(
      Endpoint.DAY_PLAN.SCHEDULE_BY_ID(dayPlanId),
      {
        method: "POST",
        body: payload,
        authRequired: true,
      },
    ),
  );
}
