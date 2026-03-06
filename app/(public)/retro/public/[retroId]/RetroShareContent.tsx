"use client";

import { useState } from "react";

import Link from "next/link";

import type { PublicRetroCardVM } from "@/entities/retro";
import { RetroCardView } from "@/entities/retro";
import { AUTH_LOGIN_PATH } from "@/shared/auth";
import { MoreActionSheet } from "@/shared/ui/bottom-sheet";
import { useToast } from "@/shared/ui/toast";

interface RetroShareContentProps {
  vm: PublicRetroCardVM;
}

export function RetroShareContent({ vm }: RetroShareContentProps) {
  const [isActionSheetOpen, setIsActionSheetOpen] = useState(false);
  const { showToast } = useToast();

  const handleShareClick = async () => {
    setIsActionSheetOpen(false);
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: `${vm.dateLabel} 회고 | ${vm.authorNickname}`, url });
      } catch {
        // user cancelled or share failed — silently ignore
      }
    } else {
      await navigator.clipboard.writeText(url);
      showToast("링크가 복사되었습니다.", "success");
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto px-7 py-4">
        <RetroCardView
          vm={vm}
          isLiked={false}
          likeCount={vm.likeCount}
          onLikeClick={() => {}}
          onMoreClick={() => setIsActionSheetOpen(true)}
          actionSheet={
            isActionSheetOpen ? (
              <MoreActionSheet
                open={isActionSheetOpen}
                onOpenChange={setIsActionSheetOpen}
              >
                <button
                  type="button"
                  onClick={() => void handleShareClick()}
                  className="h-12 w-full rounded-xl border border-[#d9d9d9] bg-white text-[16px] font-semibold text-black"
                >
                  공유하기
                </button>
              </MoreActionSheet>
            ) : null
          }
        />
      </div>

      <div className="flex flex-col gap-3 px-7 pt-4 pb-[calc(env(safe-area-inset-bottom)+24px)]">
        <Link
          href="/retro/public"
          className="flex h-12 w-full items-center justify-center rounded-xl bg-[#f5f5f5] text-[15px] font-semibold text-black"
        >
          둘러보기
        </Link>
        <Link
          href={AUTH_LOGIN_PATH}
          className="bg-ink-900 flex h-12 w-full items-center justify-center rounded-xl text-[15px] font-semibold text-white"
        >
          로그인하기
        </Link>
      </div>
    </div>
  );
}
