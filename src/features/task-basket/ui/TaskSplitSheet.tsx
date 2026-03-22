"use client";

import type { ReactNode } from "react";

import { BottomSheet } from "@/shared/ui/bottom-sheet/bottom-sheet";
import { TaskSplitSheetContent } from "@/shared/ui/task-split";
import type { TaskSplitGroup, TaskSplitItem } from "@/shared/ui/task-split";
import {
  TASK_SPLIT_SHEET_DEFAULT_DESCRIPTION,
  TASK_SPLIT_SHEET_DEFAULT_REMOVE_ITEM_ARIA_LABEL,
  TASK_SPLIT_SHEET_DEFAULT_SUBMIT_LABEL,
  TASK_SPLIT_SHEET_DEFAULT_SUBMIT_PENDING_LABEL,
  TASK_SPLIT_SHEET_DEFAULT_TITLE,
} from "./TaskSplitSheet.constants";

interface TaskSplitSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groups: TaskSplitGroup[];
  onAddItem?: (groupId: TaskSplitGroup["id"]) => void;
  onChangeItem?: (
    groupId: TaskSplitGroup["id"],
    itemId: TaskSplitItem["id"],
    value: string,
  ) => void;
  onRemoveItem?: (groupId: TaskSplitGroup["id"], itemId: TaskSplitItem["id"]) => void;
  onSubmit?: () => void;
  isSubmitting?: boolean;
  title?: string;
  description?: ReactNode;
  submitLabel?: string;
}

export { TaskSplitSheetContent };
export type { TaskSplitGroup, TaskSplitItem };

export function TaskSplitSheet({
  open,
  onOpenChange,
  groups,
  onAddItem,
  onChangeItem,
  onRemoveItem,
  onSubmit,
  isSubmitting = false,
  title = TASK_SPLIT_SHEET_DEFAULT_TITLE,
  description = TASK_SPLIT_SHEET_DEFAULT_DESCRIPTION,
  submitLabel = TASK_SPLIT_SHEET_DEFAULT_SUBMIT_LABEL,
}: TaskSplitSheetProps) {
  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      peekHeight={70}
      expandHeight={70}
      fitContent
      sheetClassName="max-h-[80vh]"
      className="pb-[env(safe-area-inset-bottom)]"
    >
      <TaskSplitSheetContent
        groups={groups}
        onAddItem={onAddItem}
        onChangeItem={onChangeItem}
        onRemoveItem={onRemoveItem}
        onSubmit={onSubmit}
        isSubmitting={isSubmitting}
        title={title}
        description={description}
        submitLabel={submitLabel}
        submitPendingLabel={TASK_SPLIT_SHEET_DEFAULT_SUBMIT_PENDING_LABEL}
        removeItemAriaLabel={TASK_SPLIT_SHEET_DEFAULT_REMOVE_ITEM_ARIA_LABEL}
      />
    </BottomSheet>
  );
}
