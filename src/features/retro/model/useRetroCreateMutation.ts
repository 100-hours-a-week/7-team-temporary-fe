import { ApiError, Endpoint } from "@/shared/api";
import { useApiMutation } from "@/shared/query";
import type { RetroCreateResponseDto } from "@/entities/retro";

import { toRetroCreateRequestDto } from "./dto";
import type { RetroCreateFormModel, RetroCreateRequestDto } from "./types";

interface UseRetroCreateMutationOptions {
  dayPlanId: number | null;
  invalidateKeys?: Array<readonly unknown[]>;
  onSuccess?: (data: RetroCreateResponseDto) => void;
}

const DUPLICATED_RETRO_MESSAGE = "이미 회고가 작성된 일정입니다.";
const DUPLICATED_RETRO_USER_MESSAGE = "이미 회고를 작성한 하루입니다.";

function mapRetroCreateError(error: unknown): Error {
  if (error instanceof ApiError && error.message.includes(DUPLICATED_RETRO_MESSAGE)) {
    return Object.assign(new Error(error.message), {
      expose: true,
      userMessage: DUPLICATED_RETRO_USER_MESSAGE,
    });
  }

  if (error instanceof Error) {
    return error;
  }

  return new Error("알 수 없는 오류가 발생했습니다.");
}

export function useRetroCreateMutation(options: UseRetroCreateMutationOptions) {
  return useApiMutation<RetroCreateFormModel, RetroCreateRequestDto, RetroCreateResponseDto>({
    url: () => {
      if (!options.dayPlanId) {
        throw new Error("dayPlanId가 없습니다.");
      }
      return Endpoint.DAY_PLAN.REFLECTION(options.dayPlanId);
    },
    method: "POST",
    dtoFn: toRetroCreateRequestDto,
    authRequired: true,
    refreshOnUnauthorized: true,
    invalidateKeys: options.invalidateKeys ?? [],
    errorMapper: mapRetroCreateError,
    onSuccess: (data) => options.onSuccess?.(data),
  });
}
