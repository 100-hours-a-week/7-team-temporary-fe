import { Endpoint } from "@/shared/api";
import { useApiMutation } from "@/shared/query";

interface RetroVisibilityInput {
  reflectionId: number;
  isOpen: boolean;
}

interface RetroVisibilityRequestDto {
  isOpen: boolean;
}

interface UseRetroVisibilityMutationOptions {
  invalidateKeys?: Array<readonly unknown[]>;
  onSuccess?: () => void;
}

export function useRetroVisibilityMutation({
  invalidateKeys = [],
  onSuccess,
}: UseRetroVisibilityMutationOptions = {}) {
  return useApiMutation<RetroVisibilityInput, RetroVisibilityRequestDto, void>({
    url: (form) => Endpoint.RETRO.UPDATE_VISIBILITY(form.reflectionId),
    method: "PATCH",
    dtoFn: ({ isOpen }) => ({ isOpen }),
    authRequired: true,
    refreshOnUnauthorized: true,
    invalidateKeys,
    onSuccess,
  });
}
