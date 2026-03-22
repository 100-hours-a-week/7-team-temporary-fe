import { ConfirmDialog } from "@/shared/ui/dialogs";
import {
  TASK_BASKET_DELETE_DIALOG_CANCEL_LABEL,
  TASK_BASKET_DELETE_DIALOG_CONFIRM_LABEL,
  TASK_BASKET_DELETE_DIALOG_CONFIRM_PENDING_LABEL,
  TASK_BASKET_DELETE_DIALOG_DESCRIPTION,
  TASK_BASKET_DELETE_DIALOG_TITLE,
} from "../model/constants";

interface TaskBasketDeleteDialogProps {
  open: boolean;
  isPending: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function TaskBasketDeleteDialog({
  open,
  isPending,
  onOpenChange,
  onConfirm,
}: TaskBasketDeleteDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={TASK_BASKET_DELETE_DIALOG_TITLE}
      description={TASK_BASKET_DELETE_DIALOG_DESCRIPTION}
      confirmText={
        isPending
          ? TASK_BASKET_DELETE_DIALOG_CONFIRM_PENDING_LABEL
          : TASK_BASKET_DELETE_DIALOG_CONFIRM_LABEL
      }
      cancelText={TASK_BASKET_DELETE_DIALOG_CANCEL_LABEL}
      confirmDisabled={isPending}
      cancelDisabled={isPending}
      onConfirm={onConfirm}
      contentClassName="bg-white rounded-3xl"
      trigger={
        <button
          type="button"
          className="hidden"
        />
      }
    />
  );
}
