"use client";

import type { UseMutationOptions } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";

import { deleteFriend } from "../api";

export function useDeleteFriendMutation(
  options: UseMutationOptions<unknown, unknown, number> = {},
) {
  return useMutation({
    mutationFn: (friendUserId: number) => deleteFriend({ friendUserId }),
    ...options,
  });
}
