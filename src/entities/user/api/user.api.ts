import { apiFetch, Endpoint } from "@/shared/api";
import { AuthService } from "@/shared/auth";

import type {
  MyProfileResponseDto,
  UpdateMyProfileRequestDto,
  UpdateMyProfileImageRequestDto,
  UpdatePasswordRequestDto,
} from "./types";
import type { MyProfileModel, UpdateMyProfileModel, UpdatePasswordModel } from "../model/types";
import {
  toMyProfileModel,
  toUpdateMyProfileRequestDto,
  toUpdatePasswordRequestDto,
} from "../model/mappers";

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

export async function updateMyProfileImage(imageKey: string): Promise<void> {
  return AuthService.refreshAndRetry(async () => {
    await apiFetch<void, UpdateMyProfileImageRequestDto>(Endpoint.USER.IMAGE, {
      method: "PATCH",
      body: { imageKey },
      authRequired: true,
    });
  });
}

export async function updatePassword(model: UpdatePasswordModel): Promise<void> {
  return AuthService.refreshAndRetry(async () => {
    await apiFetch<void, UpdatePasswordRequestDto>(Endpoint.USER.PASSWORD, {
      method: "PATCH",
      body: toUpdatePasswordRequestDto(model),
      authRequired: true,
    });
  });
}

export async function deleteMyProfile(): Promise<void> {
  return AuthService.refreshAndRetry(async () => {
    await apiFetch<void>(Endpoint.USER.BASE, {
      method: "DELETE",
      authRequired: true,
    });
  });
}
