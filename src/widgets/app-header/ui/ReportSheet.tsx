"use client";

import { useState } from "react";

import { createIssue } from "@/entities/issue";
import { ActionSheetContent } from "@/shared/ui/bottom-sheet/action-sheet-content";
import { BottomSheet } from "@/shared/ui/bottom-sheet/bottom-sheet";
import { useToast } from "@/shared/ui/toast";

interface ReportSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ReportSheet({ open, onOpenChange, onConfirm, onCancel }: ReportSheetProps) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async () => {
    const trimmed = content.trim();
    if (!trimmed) {
      showToast("내용을 입력해주세요.", "error");
      return;
    }
    try {
      setIsSubmitting(true);
      await createIssue({ content: trimmed });
      showToast("접수되었습니다. 감사합니다.", "success");
      setContent("");
      onConfirm();
    } catch (error) {
      console.error("[ReportSheet] issue submit failed", error);
      showToast("접수에 실패했습니다. 잠시 후 다시 시도해주세요.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setContent("");
    onCancel();
  };

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
        primaryLoading={isSubmitting}
        primaryLoadingText="접수 중..."
        primaryDisabled={isSubmitting}
        secondaryDisabled={isSubmitting}
        onPrimary={handleSubmit}
        onSecondary={handleCancel}
      >
        <p className="text-lg font-semibold text-neutral-900">앱에 대한 의견이 있으신가요?</p>
        <p className="mt-3 text-sm text-neutral-700">
          불편한 점이나 개선 아이디어를 알려주세요. <br /> 확인 후 반영하겠습니다.
        </p>
        <textarea
          placeholder="예) 로그인 속도가 느려요 / 캘린더 기능 개선해주세요"
          rows={3}
          value={content}
          onChange={(event) => setContent(event.target.value)}
          className="focus:ring-primary-200 mt-4 max-h-[100px] w-full resize-none rounded-xl border border-neutral-200 px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:ring-2 focus:outline-none"
        />
      </ActionSheetContent>
    </BottomSheet>
  );
}
