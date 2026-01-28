"use client";

import type { Meta, StoryObj } from "@storybook/nextjs";
import { TodoList } from "./TodoList";
import type { TodoCartTaskItemModel } from "../model/taskModels";

const meta: Meta<typeof TodoList> = {
  title: "features/home/TodoList",
  component: TodoList,
};

export default meta;

type Story = StoryObj<typeof TodoList>;

const baseTask: TodoCartTaskItemModel = {
  scheduleId: 4,
  title: "산책",
  type: "FLEX",
  startAt: "20:00",
  endAt: "21:00",
  estimatedTimeRange: "1시간",
  focusLevel: 1,
  isUrgent: false,
  assignedBy: "USER",
};

export const Default: Story = {
  args: {
    tasks: [baseTask, { ...baseTask, scheduleId: 5, title: "운동", startAt: "22:00" }],
    onEdit: () => undefined,
    onDelete: () => undefined,
  },
};

export const Empty: Story = {
  args: {
    tasks: [],
    onEdit: () => undefined,
    onDelete: () => undefined,
  },
};

export const Mixed: Story = {
  args: {
    tasks: [
      { ...baseTask, scheduleId: 6, type: "FIXED", startAt: "09:00" },
      { ...baseTask, scheduleId: 7, type: "FLEX", startAt: "" },
      { ...baseTask, scheduleId: 8, assignedBy: "AI", type: "FLEX", startAt: "12:00" },
    ],
    onEdit: () => undefined,
    onDelete: () => undefined,
  },
};
