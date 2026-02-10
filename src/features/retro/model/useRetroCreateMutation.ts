import { Endpoint } from "@/shared/api";
import { useApiMutation } from "@/shared/query";
import type { RetroCreateResponseDto } from "@/entities/retro";

import { toRetroCreateRequestDto } from "./dto";
import type { RetroCreateFormModel, RetroCreateRequestDto } from "./types";

interface UseRetroCreateMutationOptions {
  onSuccess?: (data: RetroCreateResponseDto) => void;
}

export function useRetroCreateMutation(options: UseRetroCreateMutationOptions = {}) {
  return useApiMutation<RetroCreateFormModel, RetroCreateRequestDto, RetroCreateResponseDto>({
    url: Endpoint.RETRO.BASE,
    method: "POST",
    dtoFn: toRetroCreateRequestDto,
    authRequired: true,
    refreshOnUnauthorized: true,
    onSuccess: (data) => options.onSuccess?.(data),
  });
}
