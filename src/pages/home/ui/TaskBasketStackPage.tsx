"use client";

import { useEffect, useMemo, useState } from "react";

import type { TodoCartTaskItemModel } from "@/features/home";
import { TaskBasketAddSheet, TodoList, useDayPlanId } from "@/features/home";
import { FixedActionBar, PrimaryButton } from "@/shared/ui/button";
import { useStackPage } from "@/widgets/stack";

type TodoTask = TodoCartTaskItemModel & { status?: "TODO" | "DONE" };

const formatDateParam = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export function TaskBasketStackPage() {
  const { setHeaderContent } = useStackPage();
  const today = useMemo(() => new Date(), []);
  const queryDate = useMemo(() => formatDateParam(today), [today]);
  const { dayPlanId } = useDayPlanId({ date: queryDate, page: 1, size: 1 });

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TodoTask | null>(null);
  const [tasks, setTasks] = useState<TodoTask[]>([]);

  useEffect(() => {
    setHeaderContent(<span className="text-xl font-semibold text-black">작업 바구니</span>);
    return () => setHeaderContent(null);
  }, [setHeaderContent]);

  const handleOpenSheet = () => {
    setIsSheetOpen(true);
  };

  const handleEditTask = (task: TodoTask) => {
    setEditingTask(task);
    setIsSheetOpen(true);
  };

  const handleSheetOpenChange = (nextOpen: boolean) => {
    setIsSheetOpen(nextOpen);
    if (!nextOpen) {
      setEditingTask(null);
    }
  };

  const handleUpdateTask = (nextTask: TodoTask) => {
    setTasks((prev) => {
      const map = new Map(prev.map((task) => [task.scheduleId, task]));
      map.set(nextTask.scheduleId, nextTask);
      return Array.from(map.values());
    });
  };

  return (
    <>
      <div className="px-6 pt-[13px] pb-32">
        <div className="mb-4 text-[18px] font-semibold text-neutral-900">
          {today.getMonth() + 1}월 {today.getDate()}일{" "}
          {["일", "월", "화", "수", "목", "금", "토"][today.getDay()]}
        </div>
        <div className="flex items-center justify-between">
          <div className="text-[18px] font-semibold text-neutral-900">수행되지 않은 Todo list</div>
          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-neutral-200 text-2xl text-neutral-900"
            aria-label="할 일 추가"
            onClick={handleOpenSheet}
          >
            +
          </button>
        </div>
        <div className="mt-6">
          <TodoList
            tasks={tasks}
            dayPlanId={dayPlanId}
            onEdit={handleEditTask}
            onDelete={() => undefined}
          />
        </div>
      </div>

      <FixedActionBar>
        <PrimaryButton
          className="w-full"
          onClick={handleOpenSheet}
        >
          할 일 추가
        </PrimaryButton>
      </FixedActionBar>

      <TaskBasketAddSheet
        open={isSheetOpen}
        onOpenChange={handleSheetOpenChange}
        tasks={tasks}
        dayPlanId={dayPlanId}
        onAddTask={(task) => setTasks((prev) => [task, ...prev])}
        editingTask={editingTask}
        onUpdateTask={handleUpdateTask}
      />
    </>
  );
}
