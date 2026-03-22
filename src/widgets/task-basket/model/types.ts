import type { TodoCartTaskItemModel } from "@/entities/day-plan-schedule";
import type { TaskSplitGroup, TaskSplitItem } from "@/shared/ui/task-split";

export type TaskBasketTodoTask = TodoCartTaskItemModel & { status?: "TODO" | "DONE" };

export type TaskBasketFlowStep = "idle" | "loading" | "ai" | "taskSplit";

export type TaskBasketSplitItem = TaskSplitItem;
export type TaskBasketSplitGroup = TaskSplitGroup;
