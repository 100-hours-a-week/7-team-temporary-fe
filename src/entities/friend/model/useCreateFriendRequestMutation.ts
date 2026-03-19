"use client";

import type { UseMutationOptions } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";

import { createFriendRequest, type CreateFriendRequestResponseDto } from "../api";

export function useCreateFriendRequestMutation(
  options: UseMutationOptions<CreateFriendRequestResponseDto, unknown, number> = {},
) {
  return useMutation({
    mutationFn: (targetUserId: number) => createFriendRequest({ targetUserId }),
    ...options,
  });
}
