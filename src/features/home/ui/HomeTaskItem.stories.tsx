"use client";

import type { Meta, StoryObj } from "@storybook/nextjs";
import { HomeTaskItem } from "./HomeTaskItem";
import type { TaskItemModel } from "../model/taskModels";

const meta: Meta<typeof HomeTaskItem> = {
  title: "features/home/HomeTaskItem",
  component: HomeTaskItem,
};

export default meta;

type Story = StoryObj<typeof HomeTaskItem>;

const baseTask: TaskItemModel = {
  taskId: 1,
  title: "독서하기",
  startTime: "09:00",
  endTime: "10:00",
  isCompleted: false,
  isFixedTime: false,
  timeType: "ESTIMATED",
  estimatedTimeRange: "1시간",
  focusLevel: 2,
  isUrgent: false,
};

export const Default: Story = {
  args: {
    task: baseTask,
    onToggleComplete: () => undefined,
  },
};

export const Completed: Story = {
  args: {
    task: { ...baseTask, isCompleted: true },
    onToggleComplete: () => undefined,
  },
};

export const FixedTime: Story = {
  args: {
    task: { ...baseTask, timeType: "FIXED", isFixedTime: true },
    onToggleComplete: () => undefined,
  },
};

export const AI: Story = {
  args: {
    task: { ...baseTask, timeType: "ARRANGED", assignedBy: "AI" },
    onToggleComplete: () => undefined,
  },
};
