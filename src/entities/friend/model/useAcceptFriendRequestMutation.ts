import type { UseMutationOptions } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";

import { updateFriendRequestStatus } from "../api";

const ACCEPTED_FRIEND_REQUEST_STATUS = "ACCEPTED" as const;

export function useAcceptFriendRequestMutation(
  options: UseMutationOptions<unknown, unknown, number> = {},
) {
  return useMutation({
    mutationFn: (requestId: number) =>
      updateFriendRequestStatus({
        requestId,
        status: ACCEPTED_FRIEND_REQUEST_STATUS,
      }),
    ...options,
  });
}
