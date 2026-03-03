import type { TodoCartTaskItemModel } from "@/entities/day-plan-schedule";
import type { TaskSplitGroup, TaskSplitItem } from "@/shared/ui";

export type TaskBasketTodoTask = TodoCartTaskItemModel & { status?: "TODO" | "DONE" };

export type TaskBasketFlowStep = "idle" | "loading" | "ai" | "taskSplit";

export type TaskBasketSplitItem = TaskSplitItem;
export type TaskBasketSplitGroup = TaskSplitGroup;
