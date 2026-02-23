import { useMutation, useQueryClient } from "@tanstack/react-query";

import { likeRetro, unlikeRetro } from "../api";

import { retroQueryKeys } from "./queryKeys";

interface RetroLikeVariables {
  reflectionId: number;
  nextLiked: boolean;
}

export function useRetroLikeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ reflectionId, nextLiked }: RetroLikeVariables) => {
      if (nextLiked) {
        await likeRetro(reflectionId);
        return;
      }

      await unlikeRetro(reflectionId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: retroQueryKeys.myListAll() });
      queryClient.invalidateQueries({ queryKey: retroQueryKeys.publicListAll() });
    },
  });
}
