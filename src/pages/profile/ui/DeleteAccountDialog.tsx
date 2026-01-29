import type { ReactNode } from "react";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui";

interface DeleteAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isPending: boolean;
  trigger: ReactNode;
}

export function DeleteAccountDialog({
  open,
  onOpenChange,
  onConfirm,
  isPending,
  trigger,
}: DeleteAccountDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="rounded-3xl bg-white sm:max-w-[425px]">
        <DialogHeader className="text-left">
          <DialogTitle>정말 탈퇴하시겠습니까?</DialogTitle>
          <DialogDescription>탈퇴 시 모든 정보가 삭제되며 복구할 수 없습니다.</DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-6 w-full">
          <DialogClose asChild>
            <button
              type="button"
              className="flex-1 rounded-full border border-neutral-300 px-4 py-3 text-sm font-semibold text-neutral-700"
              disabled={isPending}
            >
              취소
            </button>
          </DialogClose>
          <button
            type="button"
            className="flex-1 rounded-full bg-red-500 px-[39px] py-3 text-sm font-semibold text-white"
            onClick={onConfirm}
            disabled={isPending}
          >
            {isPending ? "탈퇴 중..." : "확인"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
