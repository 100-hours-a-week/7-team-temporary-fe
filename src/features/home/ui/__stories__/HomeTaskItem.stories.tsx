"use client";

import type { Meta, StoryObj } from "@storybook/nextjs";
import { HomeTaskItem } from "@/entities/day-plan-schedule";
import type { TaskItemModel } from "@/entities/day-plan-schedule";

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

export const CurrentTaskCard: Story = {
  args: {
    task: {
      ...baseTask,
      title: "코테 풀기",
      startTime: "08:00",
      endTime: "08:30",
      isFixedTime: true,
      timeType: "FIXED",
      isUrgent: true,
    },
    onToggleComplete: () => undefined,
  },
  render: (args) => (
    <div className="w-full max-w-[420px] bg-white px-6 py-8">
      <div className="text-ink-900 text-base font-semibold">지금 할 일</div>
      <div className="mt-4">
        <HomeTaskItem {...args} />
      </div>
    </div>
  ),
};
