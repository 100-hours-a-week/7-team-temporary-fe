import { apiFetch, Endpoint } from "@/shared/api";
import { AuthService } from "@/shared/auth";

import type {
  CreateDayPlanScheduleRequestDto,
  DayPlanScheduleItemDto,
  DayPlanScheduleResponseDto,
  UpdateDayPlanSchedulePatchRequestDto,
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

interface FetchDayPlanScheduleByIdParams {
  dayPlanId: number;
  page?: number;
  size?: number;
  signal?: AbortSignal;
}

export async function fetchDayPlanScheduleById({
  dayPlanId,
  page = 1,
  size = 10,
  signal,
}: FetchDayPlanScheduleByIdParams): Promise<DayPlanScheduleResponseDto> {
  const searchParams = new URLSearchParams({
    page: String(page),
    size: String(size),
  });

  return AuthService.refreshAndRetry(() =>
    apiFetch<DayPlanScheduleResponseDto>(
      `${Endpoint.DAY_PLAN.SCHEDULE_BY_ID(dayPlanId)}?${searchParams.toString()}`,
      {
        signal,
        authRequired: true,
      },
    ),
  );
}

interface FetchDayPlanSchedulesParams {
  dayPlanId: number;
  status?: "EXCLUDED" | "ASSIGNED" | "FIXED";
  page?: number;
  size?: number;
  signal?: AbortSignal;
}

export async function fetchDayPlanSchedules({
  dayPlanId,
  status,
  page = 1,
  size = 10,
  signal,
}: FetchDayPlanSchedulesParams): Promise<DayPlanScheduleResponseDto> {
  const searchParams = new URLSearchParams({
    page: String(page),
    size: String(size),
  });

  if (status) {
    searchParams.set("status", status);
  }

  return AuthService.refreshAndRetry(() =>
    apiFetch<DayPlanScheduleResponseDto>(
      `${Endpoint.DAY_PLAN.SCHEDULES_BY_ID(dayPlanId)}?${searchParams.toString()}`,
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

export async function updateDayPlanSchedule(
  scheduleId: number,
  payload: UpdateDayPlanSchedulePatchRequestDto,
): Promise<void> {
  const requestPayload: UpdateDayPlanSchedulePatchRequestDto = {
    targetDayPlanId: payload.targetDayPlanId,
    startAt: payload.startAt,
    endAt: payload.endAt,
  };
  return AuthService.refreshAndRetry(() =>
    apiFetch<void, UpdateDayPlanSchedulePatchRequestDto>(Endpoint.SCHEDULE.BY_ID(scheduleId), {
      method: "PATCH",
      body: requestPayload,
      authRequired: true,
    }),
  );
}
