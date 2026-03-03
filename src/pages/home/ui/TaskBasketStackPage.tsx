"use client";

import { TaskBasketAddSheet } from "@/features/home";
import { FixedActionBar, PrimaryButton } from "@/shared/ui/button";
import { useTaskBasketStackPageModel } from "../model/useTaskBasketStackPageModel";

import {
  TASK_BASKET_FLOW_ACTION_BUTTON_LABEL,
  TaskBasketDeleteDialog,
  TaskBasketFlowBottomSheet,
  TaskBasketTodoSection,
} from "@/widgets/task-basket";

export function TaskBasketStackPage() {
  const model = useTaskBasketStackPageModel();

  return (
    <>
      <TaskBasketTodoSection
        contentRef={model.contentRef}
        selectedDate={model.selectedDate}
        tasks={model.mergedTasks}
        onOpenSheet={model.handleOpenSheet}
        onEditTask={model.handleEditTask}
        onDeleteTask={model.handleDeleteRequest}
        hasMore={model.hasMore}
        isFetchingMore={model.isFetchingMore}
        onLoadMore={model.handleLoadMore}
        scrollRootRef={model.scrollRootRef}
      />

      <TaskBasketDeleteDialog
        open={model.isDeleteDialogOpen}
        onOpenChange={model.handleDeleteDialogOpenChange}
        isPending={model.deleteSchedulePending}
        onConfirm={model.handleDeleteConfirm}
      />

      <FixedActionBar>
        <PrimaryButton
          className="w-full"
          onClick={model.handleOpenFlowSheet}
        >
          {TASK_BASKET_FLOW_ACTION_BUTTON_LABEL}
        </PrimaryButton>
      </FixedActionBar>

      <TaskBasketFlowBottomSheet
        flowStep={model.flowStep}
        onOpenChange={model.handleFlowOpenChange}
        aiArrange={{
          isPending: model.aiArrangePending,
          canArrange: model.aiArrangeEnabled,
          aiUsageRemainingCount: model.aiUsageRemainingCount,
          onArrange: model.handleAiArrange,
          onCancel: model.handleAiCancel,
        }}
        taskSplit={{
          groups: model.splitGroups,
          isSubmitting: model.taskSplitSubmitting,
          onAddItem: model.handleAddSplitItem,
          onChangeItem: model.handleChangeSplitItem,
          onRemoveItem: model.handleRemoveSplitItem,
          onSubmit: model.handleTaskSplitSubmit,
        }}
      />

      <TaskBasketAddSheet
        open={model.isSheetOpen}
        onOpenChange={model.handleSheetOpenChange}
        tasks={model.mergedTasks}
        dayPlanId={model.dayPlanId}
        invalidateKeys={model.invalidateScheduleKeys}
        editingTask={model.editingTask}
        onUpdateTask={model.handleUpdateTask}
      />
    </>
  );
}
