"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { MyRetroListResponseDto } from "../api";
import { likeRetro, unlikeRetro } from "../api";

import { retroQueryKeys } from "./queryKeys";

interface RetroLikeVariables {
  reflectionId: number;
  nextLiked: boolean;
}

/**
 * 캐시된 리스트 DTO에서 특정 아이템의 likes 수만 in-place 패치한다.
 * images 배열을 건드리지 않으므로 React Query 구조적 공유가 imageUrls 참조를 유지,
 * 이미지 컴포넌트 리렌더 없이 S3 재요청을 방지한다.
 */
function patchLikeCount(
  old: MyRetroListResponseDto | undefined,
  reflectionId: number,
  delta: number,
): MyRetroListResponseDto | undefined {
  if (!old) return old;
  return {
    ...old,
    content: old.content.map((item) =>
      item.reflectionId === reflectionId
        ? { ...item, likes: Math.max(0, (item.likes ?? 0) + delta) }
        : item,
    ),
  };
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
    onSuccess: (_data, { reflectionId, nextLiked }) => {
      const delta = nextLiked ? 1 : -1;

      // invalidate 대신 setQueriesData로 해당 아이템의 likes만 업데이트한다.
      // → 리스트 쿼리를 stale로 만들지 않으므로 refetch가 발생하지 않음
      // → 새 presigned URL이 반환되지 않아 S3 이미지 재요청이 없음
      // → 구조적 공유로 images 배열 참조가 유지되어 이미지 컴포넌트 리렌더 없음
      queryClient.setQueriesData<MyRetroListResponseDto>(
        { queryKey: retroQueryKeys.myListAll() },
        (old) => patchLikeCount(old, reflectionId, delta),
      );
      queryClient.setQueriesData<MyRetroListResponseDto>(
        { queryKey: retroQueryKeys.publicListAll() },
        (old) => patchLikeCount(old, reflectionId, delta),
      );
    },
  });
}
