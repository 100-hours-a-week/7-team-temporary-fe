import type {
  DayPlanScheduleAssignedBy,
  DayPlanScheduleAssignmentStatus,
  DayPlanScheduleDuration,
  DayPlanScheduleStatus,
  DayPlanScheduleType,
} from "../api";

export interface DayPlanScheduleModel {
  scheduleId: number;
  parentTitle?: string | null;
  title: string;
  status: DayPlanScheduleStatus;
  type: DayPlanScheduleType;
  assignedBy: DayPlanScheduleAssignedBy;
  assignmentStatus: DayPlanScheduleAssignmentStatus;
  startAt: string;
  endAt: string;
  estimatedTimeRange: DayPlanScheduleDuration | string | null;
  focusLevel: number | null;
  isUrgent: boolean | null;
}

export interface DayPlanScheduleListModel {
  dayPlanId: number;
  aiUsageRemainingCount?: number;
  content: DayPlanScheduleModel[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface DayPlanSchedulePatchModel {
  targetDayPlanId: number;
  startAt: string;
  endAt: string;
}
