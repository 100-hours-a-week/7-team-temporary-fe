import { apiFetch, Endpoint } from "@/shared/api";
import { AuthService } from "@/shared/auth";

import type { MyProfileResponseDto, UpdateMyProfileRequestDto } from "./types";
import type { MyProfileModel, UpdateMyProfileModel } from "../model/types";
import { toMyProfileModel, toUpdateMyProfileRequestDto } from "../model/mappers";

export async function fetchMyProfile(signal?: AbortSignal): Promise<MyProfileModel> {
  return AuthService.refreshAndRetry(async () => {
    const res = await apiFetch<MyProfileResponseDto>(Endpoint.USER.BASE, {
      signal,
      authRequired: true,
    });
    return toMyProfileModel(res);
  });
}

export async function updateMyProfile(model: UpdateMyProfileModel): Promise<void> {
  return AuthService.refreshAndRetry(async () => {
    await apiFetch<void, UpdateMyProfileRequestDto>(Endpoint.USER.BASE, {
      method: "PATCH",
      body: toUpdateMyProfileRequestDto(model),
      authRequired: true,
    });
  });
}
