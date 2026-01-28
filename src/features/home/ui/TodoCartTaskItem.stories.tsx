"use client";

import type { Meta, StoryObj } from "@storybook/nextjs";
import { TodoCartTaskItem } from "./TodoCartTaskItem";
import type { TodoCartTaskItemModel } from "../model/taskModels";

const meta: Meta<typeof TodoCartTaskItem> = {
  title: "features/home/TodoCartTaskItem",
  component: TodoCartTaskItem,
};

export default meta;

type Story = StoryObj<typeof TodoCartTaskItem>;

const baseTask: TodoCartTaskItemModel = {
  scheduleId: 1,
  title: "스트레칭 30분",
  type: "FLEX",
  startAt: "13:00",
  endAt: "14:00",
  estimatedTimeRange: "30분",
  focusLevel: 3,
  isUrgent: false,
  assignedBy: "USER",
};

export const Unassigned: Story = {
  args: {
    task: baseTask,
    viewMode: "UNASSIGNED",
    onEdit: () => undefined,
    onDelete: () => undefined,
  },
};

export const Arranged: Story = {
  args: {
    task: { ...baseTask, type: "FIXED" },
    viewMode: "ARRANGED",
    onEdit: () => undefined,
    onDelete: () => undefined,
  },
};

export const AIRestricted: Story = {
  args: {
    task: { ...baseTask, assignedBy: "AI", type: "FLEX" },
    viewMode: "ARRANGED",
    onEdit: () => undefined,
    onDelete: () => undefined,
  },
};
