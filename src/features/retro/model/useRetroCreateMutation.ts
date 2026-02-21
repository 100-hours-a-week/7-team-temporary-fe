import { Endpoint } from "@/shared/api";
import { useApiMutation } from "@/shared/query";
import type { RetroCreateResponseDto } from "@/entities/retro";

import { toRetroCreateRequestDto } from "./dto";
import type { RetroCreateFormModel, RetroCreateRequestDto } from "./types";

interface UseRetroCreateMutationOptions {
  dayPlanId: number | null;
  invalidateKeys?: Array<readonly unknown[]>;
  onSuccess?: (data: RetroCreateResponseDto) => void;
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
    onSuccess: (data) => options.onSuccess?.(data),
  });
}
