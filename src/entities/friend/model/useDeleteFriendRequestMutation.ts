import type { UseMutationOptions } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";

import { deleteFriendRequest } from "../api";

export function useDeleteFriendRequestMutation(
  options: UseMutationOptions<unknown, unknown, number> = {},
) {
  return useMutation({
    mutationFn: (requestId: number) => deleteFriendRequest({ requestId }),
    ...options,
  });
}
