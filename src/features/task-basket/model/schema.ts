import { z } from "zod";

import {
  TASK_DURATION_ERRORS,
  TASK_DURATION_OPTIONS,
  getTaskContentError,
  getTaskTimeRangeError,
} from "@/shared/validation";

import type { TaskBasketFormModel } from "./types";

export const taskBasketFormSchema = z
  .object({
    content: z.string().superRefine((value, ctx) => {
      const error = getTaskContentError(value);
      if (error) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: error });
      }
    }),
    isFixed: z.boolean(),
    startHour: z.string(),
    startMinute: z.string(),
    endHour: z.string(),
    endMinute: z.string(),
    duration: z.union([z.enum(TASK_DURATION_OPTIONS), z.null()]),
    immersion: z.number().min(1).max(10),
    isUrgent: z.boolean(),
  })
  .superRefine((values, ctx) => {
    if (values.isFixed) {
      const error = getTaskTimeRangeError(
        values.startHour,
        values.startMinute,
        values.endHour,
        values.endMinute,
      );
      if (error) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["startHour"],
          message: error,
        });
      }
      return;
    }

    if (!values.duration) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["duration"],
        message: TASK_DURATION_ERRORS.REQUIRED,
      });
    }
  }) satisfies z.ZodType<TaskBasketFormModel>;
