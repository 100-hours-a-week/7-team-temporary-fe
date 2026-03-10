import type { TaskDurationOption } from "@/shared/validation";

export interface TaskBasketFormModel {
  content: string;
  isFixed: boolean;
  startHour: string;
  startMinute: string;
  endHour: string;
  endMinute: string;
  duration: TaskDurationOption | null;
  immersion: number;
  isUrgent: boolean;
}

export const TASK_BASKET_FORM_DEFAULTS: TaskBasketFormModel = {
  content: "",
  isFixed: false,
  startHour: "",
  startMinute: "",
  endHour: "",
  endMinute: "",
  duration: null,
  immersion: 5,
  isUrgent: false,
};
