"use client";

import type { Meta, StoryObj } from "@storybook/nextjs";
import { ExcludedTaskItem } from "./ExcludedTaskItem";
import type { ExcludedTaskItemModel } from "../model/taskModels";

const meta: Meta<typeof ExcludedTaskItem> = {
  title: "features/home/ExcludedTaskItem",
  component: ExcludedTaskItem,
};

export default meta;

type Story = StoryObj<typeof ExcludedTaskItem>;

const baseTask: ExcludedTaskItemModel = {
  scheduleId: 3,
  title: "요가",
  assignmentStatus: "EXCLUDED",
  startAt: "18:00",
  endAt: "19:00",
};

export const Default: Story = {
  args: {
    task: baseTask,
    onRestore: () => undefined,
  },
};

export const PendingSwap: Story = {
  args: {
    task: baseTask,
    variant: "PENDING_SWAP",
    onRestore: () => undefined,
  },
};

export const TimeConflict: Story = {
  args: {
    task: baseTask,
    variant: "TIME_CONFLICT",
    onRestore: () => undefined,
  },
};
