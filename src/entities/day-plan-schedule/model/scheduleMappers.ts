import type { DayPlanScheduleItemDto, DayPlanScheduleResponseDto } from "../api";
import type { DayPlanScheduleListModel, DayPlanScheduleModel } from "./scheduleModels";

const DEFAULT_TITLE = "제목 없음";
const DEFAULT_ASSIGNED_BY: DayPlanScheduleModel["assignedBy"] = "USER";
const DEFAULT_ASSIGNMENT_STATUS: DayPlanScheduleModel["assignmentStatus"] = "NOT_ASSIGNED";

export function toDayPlanScheduleModel(dto: DayPlanScheduleItemDto): DayPlanScheduleModel {
  return {
    scheduleId: dto.scheduleId,
    parentTitle: dto.parentTitle ?? null,
    title: dto.title?.trim() || DEFAULT_TITLE,
    status: dto.status,
    type: dto.type,
    assignedBy: dto.assignedBy ?? DEFAULT_ASSIGNED_BY,
    assignmentStatus: dto.assignmentStatus ?? DEFAULT_ASSIGNMENT_STATUS,
    startAt: dto.startAt ?? "",
    endAt: dto.endAt ?? "",
    estimatedTimeRange: dto.estimatedTimeRange ?? null,
    focusLevel: dto.focusLevel ?? null,
    isUrgent: dto.isUrgent ?? null,
  };
}

export function toDayPlanScheduleModelOrNull(dto: DayPlanScheduleItemDto | null) {
  if (!dto) return null;
  return toDayPlanScheduleModel(dto);
}

export function toDayPlanScheduleListModel(
  dto: DayPlanScheduleResponseDto,
): DayPlanScheduleListModel {
  return {
    dayPlanId: dto.dayPlanId,
    aiUsageRemainingCount: dto.aiUsageRemainingCount,
    content: dto.content.map(toDayPlanScheduleModel),
    page: dto.page,
    size: dto.size,
    totalElements: dto.totalElements,
    totalPages: dto.totalPages,
  };
}
