import type { ReportMessageListDto } from "../api";

import type { ReportMessageItemVM, ReportMessageListVM } from "./types";

function toReportMessageItemModel(
  item: ReportMessageListDto["content"][number],
): ReportMessageItemVM {
  return {
    messageId: item.messageId,
    senderType: item.senderType,
    messageType: item.messageType,
    content: item.content ?? "",
    sentAt: item.sentAt,
  };
}

export function toReportMessageListModel(dto: ReportMessageListDto): ReportMessageListVM {
  return {
    content: dto.content.map(toReportMessageItemModel),
    nextCursor: dto.nextCursor ?? null,
    hasNext: dto.hasNext,
    size: dto.size,
  };
}
