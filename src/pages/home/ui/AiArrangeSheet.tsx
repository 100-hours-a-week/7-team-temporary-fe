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
}

type AiArrangeSheetContentProps = Omit<AiArrangeSheetProps, "open" | "onOpenChange">;

export function AiArrangeSheetContent({
  isPending,
  canArrange,
  onArrange,
  onCancel,
}: AiArrangeSheetContentProps) {
  return (
    <div className="px-6 pt-6 pb-6 text-center">
      <p className="text-lg font-semibold text-neutral-900">
        시간이 입력되어 있지 않은
        <br />
        작업이 존재합니다.
      </p>
      <p className="mt-3 text-sm text-neutral-700">집중 시간에 따라 AI 자동으로 배치할까요?</p>
      <p className="mt-2 text-xs text-neutral-400">AI를 사용할 수 있는 남은 횟수는 1번 입니다.</p>
      <div className="mt-6 flex gap-3">
        <PrimaryButton
          className="bg-primary-600 hover:bg-primary-700 w-full text-white"
          isLoading={isPending}
          loadingText="배치 중..."
          disabled={!canArrange || isPending}
          onClick={onArrange}
        >
          AI 자동배치
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
      />
    </BottomSheet>
  );
}
