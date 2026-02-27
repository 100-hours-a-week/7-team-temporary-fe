import { Endpoint } from "@/shared/api";
import { useApiMutation } from "@/shared/query";

interface RetroUpdateInput {
  reflectionId: number;
  content: string;
  isOpen: boolean;
  reflectionImageKeys: string[];
}

interface RetroUpdateRequestDto {
  content: string;
  isOpen: boolean;
  reflectionImageKeys: string[];
}

interface UseRetroUpdateMutationOptions {
  invalidateKeys?: Array<readonly unknown[]>;
  onSuccess?: () => void;
}

export function useRetroUpdateMutation({
  invalidateKeys = [],
  onSuccess,
}: UseRetroUpdateMutationOptions = {}) {
  return useApiMutation<RetroUpdateInput, RetroUpdateRequestDto, void>({
    url: (form) => Endpoint.RETRO.UPDATE(form.reflectionId),
    method: "PUT",
    dtoFn: ({ content, isOpen, reflectionImageKeys }) => ({ content, isOpen, reflectionImageKeys }),
    authRequired: true,
    refreshOnUnauthorized: true,
    invalidateKeys,
    onSuccess,
  });
}
