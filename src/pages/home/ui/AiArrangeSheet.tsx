"use client";

import { BottomSheet } from "@/shared/ui";
import { PrimaryButton } from "@/shared/ui/button";

interface AiArrangeSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isPending: boolean;
  canArrange: boolean;
  onArrange: () => void;
  onCancel: () => void;
  aiUsageRemainingCount?: number | null;
}

type AiArrangeSheetContentProps = Omit<AiArrangeSheetProps, "open" | "onOpenChange">;

export function AiArrangeSheetContent({
  isPending,
  canArrange,
  onArrange,
  onCancel,
  aiUsageRemainingCount,
}: AiArrangeSheetContentProps) {
  return (
    <div className="px-6 pt-6 pb-6 text-center">
      <p className="text-lg font-semibold text-neutral-900">
        시간이 입력되어 있지 않은
        <br />
        작업이 존재합니다.
      </p>
      <p className="mt-3 text-sm text-neutral-700">집중 시간에 따라 AI가 자동으로 배치할께요!</p>
      {aiUsageRemainingCount !== null && aiUsageRemainingCount !== undefined ? (
        <p className="mt-2 text-xs text-neutral-400">
          남은 자동 배치 횟수: {aiUsageRemainingCount}회
        </p>
      ) : (
        <p className="mt-2 text-xs text-neutral-400" />
      )}
      <div className="mt-6 flex gap-3">
        <PrimaryButton
          className="bg-primary-600 hover:bg-primary-700 w-full text-white"
          isLoading={isPending}
          loadingText="배치 중..."
          disabled={!canArrange || isPending}
          onClick={onArrange}
        >
          자동배치
        </PrimaryButton>
        <PrimaryButton
          className="w-full bg-neutral-100 text-neutral-500 hover:bg-neutral-100"
          disabled={isPending}
          onClick={onCancel}
        >
          취소
        </PrimaryButton>
      </div>
    </div>
  );
}

export function AiArrangeSheet({
  open,
  onOpenChange,
  isPending,
  canArrange,
  onArrange,
  onCancel,
  aiUsageRemainingCount,
}: AiArrangeSheetProps) {
  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && isPending) return;
    onOpenChange(nextOpen);
  };

  return (
    <BottomSheet
      open={open}
      onOpenChange={handleOpenChange}
      peekHeight={35}
      expandHeight={35}
      closeOnOverlayClick={!isPending}
      fitContent
      className="pb-[env(safe-area-inset-bottom)]"
    >
      <AiArrangeSheetContent
        isPending={isPending}
        canArrange={canArrange}
        onArrange={onArrange}
        onCancel={onCancel}
        aiUsageRemainingCount={aiUsageRemainingCount}
      />
    </BottomSheet>
  );
}
