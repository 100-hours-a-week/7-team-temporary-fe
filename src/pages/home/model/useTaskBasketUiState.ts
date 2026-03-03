"use client";

import { useCallback, useState } from "react";

import type { TaskBasketTodoTask } from "@/widgets/task-basket";

export function useTaskBasketUiState() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskBasketTodoTask | null>(null);
  const [tasks, setTasks] = useState<TaskBasketTodoTask[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  const handleOpenSheet = useCallback(() => {
    setIsSheetOpen(true);
  }, []);

  const handleEditTask = useCallback((task: TaskBasketTodoTask) => {
    setEditingTask(task);
    setIsSheetOpen(true);
  }, []);

  const handleDeleteRequest = useCallback((scheduleId: number) => {
    setDeleteTargetId(scheduleId);
    setIsDeleteDialogOpen(true);
  }, []);

  const closeDeleteDialog = useCallback(() => {
    setIsDeleteDialogOpen(false);
    setDeleteTargetId(null);
  }, []);

  const handleDeleteDialogOpenChange = useCallback(
    (open: boolean) => {
      setIsDeleteDialogOpen(open);
      if (!open) {
        closeDeleteDialog();
      }
    },
    [closeDeleteDialog],
  );

  const handleSheetOpenChange = useCallback((nextOpen: boolean) => {
    setIsSheetOpen(nextOpen);
    if (!nextOpen) {
      setEditingTask(null);
    }
  }, []);

  const handleUpdateTask = useCallback((nextTask: TaskBasketTodoTask) => {
    setTasks((prev) => {
      const map = new Map(prev.map((task) => [task.scheduleId, task]));
      map.set(nextTask.scheduleId, nextTask);
      return Array.from(map.values());
    });
  }, []);

  const removeTaskFromLocal = useCallback((scheduleId: number) => {
    setTasks((prev) => prev.filter((task) => task.scheduleId !== scheduleId));
  }, []);

  return {
    isSheetOpen,
    editingTask,
    tasks,
    isDeleteDialogOpen,
    deleteTargetId,
    handleOpenSheet,
    handleEditTask,
    handleDeleteRequest,
    handleDeleteDialogOpenChange,
    handleSheetOpenChange,
    handleUpdateTask,
    removeTaskFromLocal,
    closeDeleteDialog,
  };
}
