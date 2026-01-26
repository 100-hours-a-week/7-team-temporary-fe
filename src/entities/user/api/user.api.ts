import { apiFetch, Endpoint } from "@/shared/api";

import type { MyProfileResponseDto } from "./types";
import type { MyProfileModel } from "../model/types";
import { toMyProfileModel } from "../model/mappers";

export async function fetchMyProfile(signal?: AbortSignal): Promise<MyProfileModel> {
  const res = await apiFetch<MyProfileResponseDto>(Endpoint.USER.BASE, {
    signal,
    authRequired: true,
  });
  return toMyProfileModel(res);
}
