"use client";

import { ActionSheetContent } from "@/shared/ui/bottom-sheet/action-sheet-content";
import { BottomSheet } from "@/shared/ui/bottom-sheet/bottom-sheet";

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
  const infoText =
    aiUsageRemainingCount !== null && aiUsageRemainingCount !== undefined
      ? `남은 자동 배치 횟수: ${aiUsageRemainingCount}회`
      : null;

  return (
    <ActionSheetContent
      title={
        <>
          시간이 입력되어 있지 않은
          <br />
          작업이 존재합니다.
        </>
      }
      description="집중 시간에 따라 AI가 자동으로 배치할께요!"
      info={infoText}
      reserveInfoSpace
      primaryLabel="자동배치"
      secondaryLabel="취소"
      primaryLoading={isPending}
      primaryLoadingText="배치 중..."
      primaryDisabled={!canArrange || isPending}
      secondaryDisabled={isPending}
      onPrimary={onArrange}
      onSecondary={onCancel}
    />
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
