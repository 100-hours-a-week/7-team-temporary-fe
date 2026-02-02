import type { UseMutationOptions } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";

import { deleteMyProfile } from "../api";

export function useDeleteMyProfileMutation(
  options: UseMutationOptions<unknown, unknown, void> = {},
) {
  return useMutation({
    mutationFn: () => deleteMyProfile(),
    ...options,
  });
}
