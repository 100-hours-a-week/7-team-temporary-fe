import { ActionSheetContent } from "@/shared/ui/bottom-sheet/action-sheet-content";
import { BottomSheet } from "@/shared/ui/bottom-sheet/bottom-sheet";
import { TaskSplitSheetContent } from "@/shared/ui/task-split";
import {
  TASK_BASKET_AI_SHEET_DESCRIPTION,
  TASK_BASKET_AI_SHEET_INFO_PREFIX,
  TASK_BASKET_AI_SHEET_INFO_SUFFIX,
  TASK_BASKET_AI_SHEET_PRIMARY_LABEL,
  TASK_BASKET_AI_SHEET_PRIMARY_LOADING_LABEL,
  TASK_BASKET_AI_SHEET_SECONDARY_LABEL,
  TASK_BASKET_AI_SHEET_TITLE_LINE1,
  TASK_BASKET_AI_SHEET_TITLE_LINE2,
  TASK_BASKET_FLOW_DEFAULT_SHEET_HEIGHT,
  TASK_BASKET_FLOW_LOADING_MESSAGE,
  TASK_BASKET_FLOW_TASK_SPLIT_SHEET_HEIGHT,
  TASK_BASKET_SPLIT_SHEET_DESCRIPTION_LINE1,
  TASK_BASKET_SPLIT_SHEET_DESCRIPTION_LINE2,
  TASK_BASKET_SPLIT_SHEET_DESCRIPTION_LINE3,
  TASK_BASKET_SPLIT_SHEET_DESCRIPTION_LINE4,
  TASK_BASKET_SPLIT_SHEET_REMOVE_ITEM_ARIA_LABEL,
  TASK_BASKET_SPLIT_SHEET_SUBMIT_LABEL,
  TASK_BASKET_SPLIT_SHEET_SUBMIT_PENDING_LABEL,
  TASK_BASKET_SPLIT_SHEET_TITLE,
} from "../model/constants";
import type { TaskBasketFlowStep, TaskBasketSplitGroup, TaskBasketSplitItem } from "../model/types";

interface TaskBasketFlowBottomSheetProps {
  flowStep: TaskBasketFlowStep;
  aiArrange: {
    isPending: boolean;
    canArrange: boolean;
    aiUsageRemainingCount?: number | null;
    onArrange: () => void;
    onCancel: () => void;
  };
  taskSplit: {
    groups: TaskBasketSplitGroup[];
    isSubmitting: boolean;
    onAddItem: (groupId: TaskBasketSplitGroup["id"]) => void;
    onChangeItem: (
      groupId: TaskBasketSplitGroup["id"],
      itemId: TaskBasketSplitItem["id"],
      value: string,
    ) => void;
    onRemoveItem: (groupId: TaskBasketSplitGroup["id"], itemId: TaskBasketSplitItem["id"]) => void;
    onSubmit: () => void;
  };
  onOpenChange: (open: boolean) => void;
}

export function TaskBasketFlowBottomSheet({
  flowStep,
  aiArrange,
  taskSplit,
  onOpenChange,
}: TaskBasketFlowBottomSheetProps) {
  const aiInfoText =
    aiArrange.aiUsageRemainingCount !== null && aiArrange.aiUsageRemainingCount !== undefined
      ? `${TASK_BASKET_AI_SHEET_INFO_PREFIX}${aiArrange.aiUsageRemainingCount}${TASK_BASKET_AI_SHEET_INFO_SUFFIX}`
      : null;

  return (
    <BottomSheet
      open={flowStep !== "idle"}
      onOpenChange={onOpenChange}
      peekHeight={
        flowStep === "taskSplit"
          ? TASK_BASKET_FLOW_TASK_SPLIT_SHEET_HEIGHT
          : TASK_BASKET_FLOW_DEFAULT_SHEET_HEIGHT
      }
      expandHeight={
        flowStep === "taskSplit"
          ? TASK_BASKET_FLOW_TASK_SPLIT_SHEET_HEIGHT
          : TASK_BASKET_FLOW_DEFAULT_SHEET_HEIGHT
      }
      fitContent={flowStep !== "taskSplit"}
      closeOnOverlayClick={!(flowStep === "ai" && aiArrange.isPending)}
      enableDragHandle={flowStep === "taskSplit"}
      sheetClassName={flowStep === "taskSplit" ? "max-h-[80vh] overflow-y-auto" : undefined}
      className="pb-[env(safe-area-inset-bottom)]"
    >
      {flowStep === "ai" ? (
        <ActionSheetContent
          title={
            <>
              {TASK_BASKET_AI_SHEET_TITLE_LINE1}
              <br />
              {TASK_BASKET_AI_SHEET_TITLE_LINE2}
            </>
          }
          description={TASK_BASKET_AI_SHEET_DESCRIPTION}
          info={aiInfoText}
          reserveInfoSpace
          primaryLabel={TASK_BASKET_AI_SHEET_PRIMARY_LABEL}
          secondaryLabel={TASK_BASKET_AI_SHEET_SECONDARY_LABEL}
          primaryLoading={aiArrange.isPending}
          primaryLoadingText={TASK_BASKET_AI_SHEET_PRIMARY_LOADING_LABEL}
          primaryDisabled={!aiArrange.canArrange || aiArrange.isPending}
          secondaryDisabled={aiArrange.isPending}
          onPrimary={aiArrange.onArrange}
          onSecondary={aiArrange.onCancel}
        />
      ) : null}
      {flowStep === "taskSplit" ? (
        <TaskSplitSheetContent
          groups={taskSplit.groups}
          onAddItem={taskSplit.onAddItem}
          onChangeItem={taskSplit.onChangeItem}
          onRemoveItem={taskSplit.onRemoveItem}
          onSubmit={taskSplit.onSubmit}
          isSubmitting={taskSplit.isSubmitting}
          title={TASK_BASKET_SPLIT_SHEET_TITLE}
          description={
            <>
              {TASK_BASKET_SPLIT_SHEET_DESCRIPTION_LINE1}
              <br />
              {TASK_BASKET_SPLIT_SHEET_DESCRIPTION_LINE2}
              <br />
              {TASK_BASKET_SPLIT_SHEET_DESCRIPTION_LINE3}
              <br />
              {TASK_BASKET_SPLIT_SHEET_DESCRIPTION_LINE4}
            </>
          }
          submitLabel={TASK_BASKET_SPLIT_SHEET_SUBMIT_LABEL}
          submitPendingLabel={TASK_BASKET_SPLIT_SHEET_SUBMIT_PENDING_LABEL}
          removeItemAriaLabel={TASK_BASKET_SPLIT_SHEET_REMOVE_ITEM_ARIA_LABEL}
        />
      ) : null}
      {flowStep === "loading" ? (
        <div className="px-6 py-10 text-center text-sm text-neutral-400">
          {TASK_BASKET_FLOW_LOADING_MESSAGE}
        </div>
      ) : null}
    </BottomSheet>
  );
}
