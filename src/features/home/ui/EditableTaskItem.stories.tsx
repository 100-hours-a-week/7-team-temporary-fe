"use client";

import type { Meta, StoryObj } from "@storybook/nextjs";
import { EditableTaskItem } from "./EditableTaskItem";
import type { EditableTaskItemModel } from "../model/taskModels";

const meta: Meta<typeof EditableTaskItem> = {
  title: "features/home/EditableTaskItem",
  component: EditableTaskItem,
};

export default meta;

type Story = StoryObj<typeof EditableTaskItem>;

const baseTask: EditableTaskItemModel = {
  scheduleId: 2,
  title: "프로젝트 회의",
  status: "TODO",
  type: "FIXED",
  assignedBy: "USER",
  assignmentStatus: "ASSIGNED",
  startAt: "14:00",
  endAt: "15:00",
  estimatedTimeRange: null,
  focusLevel: 3,
  isUrgent: false,
};

export const Default: Story = {
  args: {
    task: baseTask,
    isLocked: false,
    onUpdate: () => undefined,
    onDelete: () => undefined,
    onExclude: () => undefined,
  },
};

export const Locked: Story = {
  args: {
    task: baseTask,
    isLocked: true,
    onUpdate: () => undefined,
    onDelete: () => undefined,
    onExclude: () => undefined,
  },
};

export const AI: Story = {
  args: {
    task: { ...baseTask, assignedBy: "AI", type: "FLEX" },
    isLocked: false,
    onUpdate: () => undefined,
    onDelete: () => undefined,
    onExclude: () => undefined,
  },
};
