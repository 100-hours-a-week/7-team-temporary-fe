import { updateDayPlanSchedule } from "../api";
import type { DayPlanSchedulePatchModel } from "./scheduleModels";

export async function patchDayPlanSchedule(scheduleId: number, payload: DayPlanSchedulePatchModel) {
  return updateDayPlanSchedule(scheduleId, payload);
}
