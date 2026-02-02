"use client";

import { ActionSheetContent, BottomSheet } from "@/shared/ui";

interface ReportSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ReportSheet({ open, onOpenChange, onConfirm, onCancel }: ReportSheetProps) {
  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      peekHeight={35}
      expandHeight={60}
      closeOnOverlayClick
      fitContent
      className="z-100 pb-[env(safe-area-inset-bottom)]"
    >
      <ActionSheetContent
        primaryLabel="확인"
        secondaryLabel="취소"
        onPrimary={onConfirm}
        onSecondary={onCancel}
      >
        <p className="text-lg font-semibold text-neutral-900">앱에 대한 의견이 있으신가요?</p>
        <p className="mt-3 text-sm text-neutral-700">
          불편한 점이나 개선 아이디어를 알려주세요. <br /> 확인 후 반영하겠습니다.
        </p>
        <textarea
          placeholder="예) 로그인 속도가 느려요 / 캘린더 기능 개선해주세요"
          rows={3}
          className="focus:ring-primary-200 mt-4 max-h-[100px] w-full resize-none rounded-xl border border-neutral-200 px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:ring-2 focus:outline-none"
        />
      </ActionSheetContent>
    </BottomSheet>
  );
}
