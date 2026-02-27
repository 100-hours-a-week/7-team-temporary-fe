"use client";

import { useEffect, useState } from "react";

import { useQueryClient } from "@tanstack/react-query";

import {
  RetroCardView,
  type MyRetroCardVM,
  type PublicRetroCardVM,
  useRetroLikeMutation,
  useRetroDeleteMutation,
  retroQueryKeys,
} from "@/entities/retro";
import { MoreActionSheet } from "@/shared/ui/bottom-sheet";
import { useToast } from "@/shared/ui/toast";

import { useRetroVisibilityMutation } from "../model";

type RetroListItemCardProps = {
  vm: MyRetroCardVM | PublicRetroCardVM;
  onLikeClick?: (isLiked: boolean) => Promise<void> | void;
  onMoreClick?: () => void;
  onEditClick?: () => void;
  onDeleteClick?: () => void;
  onShareClick?: () => void;
  invalidateKeys?: Array<readonly unknown[]>;
};

export function RetroListItemCard({
  vm,
  onLikeClick,
  onMoreClick,
  onEditClick,
  onDeleteClick,
  onShareClick,
  invalidateKeys,
}: RetroListItemCardProps) {
  const isMine = vm.isMine;
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const likeMutation = useRetroLikeMutation();
  const deleteMutation = useRetroDeleteMutation();
  const [isLiked, setIsLiked] = useState(vm.defaultLiked ?? false);
  const [displayLikeCount, setDisplayLikeCount] = useState(vm.likeCount);
  const [isActionSheetOpen, setIsActionSheetOpen] = useState(false);
  const [localIsOpen, setLocalIsOpen] = useState<boolean | null>(null);

  const visibilityMutation = useRetroVisibilityMutation({
    invalidateKeys: [],
    onSuccess: () => {
      const keys = invalidateKeys ?? [retroQueryKeys.myListAll(), retroQueryKeys.publicListAll()];
      keys.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key, refetchType: "none" });
      });
    },
  });

  useEffect(() => {
    setDisplayLikeCount(vm.likeCount);
  }, [vm.likeCount]);

  useEffect(() => {
    setIsLiked(vm.defaultLiked ?? false);
  }, [vm.defaultLiked]);

  useEffect(() => {
    setLocalIsOpen(null);
  }, [vm]);

  const handleLikeClick = async () => {
    if (likeMutation.isPending) return;

    const prevLiked = isLiked;
    const prevLikeCount = displayLikeCount;
    const nextLiked = !prevLiked;

    setIsLiked(nextLiked);
    setDisplayLikeCount((count) => Math.max(0, count + (nextLiked ? 1 : -1)));

    try {
      await likeMutation.mutateAsync({ reflectionId: vm.id, nextLiked });
      await Promise.resolve(onLikeClick?.(nextLiked));
    } catch {
      setIsLiked(prevLiked);
      setDisplayLikeCount(prevLikeCount);
      showToast("좋아요 처리에 실패했습니다.", "error");
    }
  };

  const isMyRetro = isMine && "isOpen" in vm;
  const isOpenChecked = isMyRetro ? (localIsOpen ?? (vm as MyRetroCardVM).isOpen) : undefined;

  const handleVisibilityToggle = isMyRetro
    ? async (checked: boolean) => {
        const myVm = vm as MyRetroCardVM;
        const prev = localIsOpen ?? myVm.isOpen;
        setLocalIsOpen(checked);
        try {
          await visibilityMutation.mutateAsync({
            reflectionId: myVm.id,
            isOpen: checked,
          });
        } catch {
          setLocalIsOpen(prev);
          showToast("공개 설정 변경에 실패했습니다.", "error");
        }
      }
    : undefined;

  const handleMoreClick = () => {
    setIsActionSheetOpen(true);
    onMoreClick?.();
  };

  const handleEditClick = () => {
    setIsActionSheetOpen(false);
    onEditClick?.();
  };

  const handleDeleteClick = async () => {
    if (deleteMutation.isPending) return;
    setIsActionSheetOpen(false);
    try {
      await deleteMutation.mutateAsync(vm.id);
      onDeleteClick?.();
    } catch {
      showToast("회고 삭제에 실패했습니다.", "error");
    }
  };

  const handleShareClick = () => {
    setIsActionSheetOpen(false);
    onShareClick?.();
  };

  return (
    <RetroCardView
      vm={vm}
      isLiked={isLiked}
      likeCount={displayLikeCount}
      onLikeClick={() => void handleLikeClick()}
      onMoreClick={handleMoreClick}
      onVisibilityToggle={
        handleVisibilityToggle ? (checked) => void handleVisibilityToggle(checked) : undefined
      }
      isOpenChecked={isOpenChecked}
      actionSheet={
        isActionSheetOpen ? (
          <MoreActionSheet
            open={isActionSheetOpen}
            onOpenChange={setIsActionSheetOpen}
          >
            <button
              type="button"
              onClick={handleShareClick}
              className="h-12 w-full rounded-xl border border-[#d9d9d9] bg-white text-[16px] font-semibold text-black"
            >
              공유하기
            </button>
            {isMine ? (
              <>
                <button
                  type="button"
                  onClick={handleEditClick}
                  className="h-12 w-full rounded-xl border border-[#d9d9d9] bg-white text-[16px] font-semibold text-black"
                >
                  수정
                </button>
                <button
                  type="button"
                  onClick={() => void handleDeleteClick()}
                  className="h-12 w-full rounded-xl bg-[#541e0f] text-[16px] font-semibold text-white"
                >
                  삭제
                </button>
              </>
            ) : null}
          </MoreActionSheet>
        ) : null
      }
    />
  );
}
