"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/modal";

interface ChatMessageContentDialogProps {
  open: boolean;
  content: string;
  onOpenChange: (open: boolean) => void;
}

export function ChatMessageContentDialog({
  open,
  content,
  onOpenChange,
}: ChatMessageContentDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent
        className="w-[calc(100%-2rem)] max-w-[420px] rounded-2xl bg-white p-0 [&>button]:hidden"
        overlayClassName="bg-black/40"
        showOverlay
      >
        <DialogHeader className="space-y-0 border-b border-neutral-100 px-5 py-4">
          <DialogTitle className="text-base font-semibold text-neutral-900">
            전체 메시지
          </DialogTitle>
          <DialogDescription className="sr-only">
            잘린 메시지 전체 내용을 확인합니다.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[55vh] overflow-y-auto px-5 py-4 text-[14px] leading-6 break-words whitespace-pre-wrap text-neutral-800">
          {content}
        </div>
      </DialogContent>
    </Dialog>
  );
}
