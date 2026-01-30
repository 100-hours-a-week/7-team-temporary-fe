"use client";

import type { ReactNode } from "react";

import { BottomSheet } from "@/shared/ui";
import { PrimaryButton } from "@/shared/ui/button";

export type TaskSplitItem = {
  id: string | number;
  value: string;
  placeholder?: string;
  helperText?: string;
};

export type TaskSplitGroup = {
  id: string | number;
  title: string;
  items: TaskSplitItem[];
  minItems?: number;
};

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

interface TaskSplitSheetContentProps {
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

const DEFAULT_TITLE = "해당 작업은 너무 포괄적이에요!";
const DEFAULT_DESCRIPTION = (
  <>
    작업을 세분화 해주세요.
    <br />
    상위 작업을 여러 개의 하위 작업으로 나누어
    <br />
    단계별로 관리할 수 있습니다.
    <br />
    하위작업은 예상 소요시간이 1~2시간으로 변경됩니다.
  </>
);
const DEFAULT_SUBMIT_LABEL = "완료";

export function TaskSplitSheetContent({
  groups,
  onAddItem,
  onChangeItem,
  onRemoveItem,
  onSubmit,
  isSubmitting = false,
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  submitLabel = DEFAULT_SUBMIT_LABEL,
}: TaskSplitSheetContentProps) {
  const hasInvalidGroupCount = groups.some((group) => {
    const minItems = group.minItems ?? 1;
    return group.items.length < minItems;
  });
  const hasEmptyItemValue = groups.some((group) =>
    group.items.some((item) => item.value.trim().length === 0),
  );
  const isSubmitDisabled = isSubmitting || hasInvalidGroupCount || hasEmptyItemValue;

  return (
    <div className="px-6 pt-2 pb-6">
      <div className="text-center text-[15px] font-semibold text-red-500">{title}</div>
      <div className="mt-2 text-center text-xs leading-5 text-neutral-600">{description}</div>

      <div className="mt-6 flex flex-col gap-5">
        {groups.map((group) => (
          <div
            key={group.id}
            className="flex flex-col gap-3"
          >
            <button
              type="button"
              className="flex items-center gap-2 text-base font-semibold text-neutral-900"
              onClick={() => onAddItem?.(group.id)}
            >
              <span>{group.title}</span>
              <span className="text-lg font-bold">+</span>
            </button>

            <div className="flex flex-col gap-2">
              {group.items.map((item) => {
                const minItems = group.minItems ?? 1;
                const isRemoveDisabled = group.items.length <= minItems;

                return (
                  <div
                    key={item.id}
                    className="flex flex-col gap-1"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={item.value}
                        placeholder={item.placeholder}
                        onChange={(event) => onChangeItem?.(group.id, item.id, event.target.value)}
                        className="flex-1 rounded-full bg-neutral-100 px-4 py-2 text-sm text-neutral-900 placeholder:text-neutral-400"
                      />
                      <button
                        type="button"
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-200 text-neutral-700 disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-400"
                        onClick={() => onRemoveItem?.(group.id, item.id)}
                        disabled={isRemoveDisabled}
                        aria-label="하위 작업 삭제"
                      >
                        ×
                      </button>
                    </div>
                    {item.helperText ? (
                      <span className="pl-4 text-xs text-neutral-400">{item.helperText}</span>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <PrimaryButton
          className="w-full rounded-2xl bg-[#ff6b6b] text-white hover:bg-[#ff5c5c]"
          onClick={onSubmit}
          disabled={isSubmitDisabled}
        >
          {isSubmitting ? "저장 중..." : submitLabel}
        </PrimaryButton>
      </div>
    </div>
  );
}

export function TaskSplitSheet({
  open,
  onOpenChange,
  groups,
  onAddItem,
  onChangeItem,
  onRemoveItem,
  onSubmit,
  isSubmitting = false,
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  submitLabel = DEFAULT_SUBMIT_LABEL,
}: TaskSplitSheetProps) {
  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      peekHeight={70}
      expandHeight={70}
      enableDragHandle
      sheetClassName="max-h-[80vh] overflow-y-auto"
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
      />
    </BottomSheet>
  );
}
