"use client";

import type { Meta, StoryObj } from "@storybook/nextjs";
import { ToastViewport } from "./ToastViewport";

const meta: Meta<typeof ToastViewport> = {
  title: "shared/ui/ToastViewport",
  component: ToastViewport,
};

export default meta;

type Story = StoryObj<typeof ToastViewport>;

export const Info: Story = {
  args: {
    toasts: [
      {
        id: "info-toast",
        message: "정보 메시지입니다",
        type: "info",
        duration: 3000,
      },
    ],
  },
};

export const Success: Story = {
  args: {
    toasts: [
      {
        id: "success-toast",
        message: "저장 완료!",
        type: "success",
        duration: 3000,
      },
    ],
  },
};

export const Error: Story = {
  args: {
    toasts: [
      {
        id: "error-toast",
        message: "아이디와 비밀번호가 틀렸습니다.",
        type: "error",
        duration: 3000,
      },
    ],
  },
};
