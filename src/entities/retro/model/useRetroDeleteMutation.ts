"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteRetro } from "../api";

import { retroQueryKeys } from "./queryKeys";

export function useRetroDeleteMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reflectionId: number) => deleteRetro(reflectionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: retroQueryKeys.myListAll() });
      queryClient.invalidateQueries({ queryKey: retroQueryKeys.publicListAll() });
    },
  });
}
