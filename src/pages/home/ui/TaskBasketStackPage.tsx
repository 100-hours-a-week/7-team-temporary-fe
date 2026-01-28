"use client";

import { useEffect, useMemo, useState } from "react";

import type { TodoCartTaskItemModel } from "@/features/home";
import { TaskBasketAddSheet, TodoList } from "@/features/home";
import { useStackPage } from "@/widgets/stack";

type TodoTask = TodoCartTaskItemModel & { status?: "TODO" | "DONE" };

export function TaskBasketStackPage() {
  const { setHeaderContent } = useStackPage();
  const today = useMemo(() => new Date(), []);

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [tasks, setTasks] = useState<TodoTask[]>([]);

  useEffect(() => {
    setHeaderContent(<span className="text-xl font-semibold text-black">작업 바구니</span>);
    return () => setHeaderContent(null);
  }, [setHeaderContent]);

  const handleOpenSheet = () => {
    setIsSheetOpen(true);
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
            onEdit={() => undefined}
            onDelete={() => undefined}
          />
        </div>
      </div>

      <TaskBasketAddSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        tasks={tasks}
        onAddTask={(task) => setTasks((prev) => [task, ...prev])}
      />
    </>
  );
}
