export interface WeeklyReportDailyStatDto {
  date: string;
  achievementRate: number;
}

export interface WeeklyReportDto {
  reportId: number;
  startDate: string;
  endDate: string;
  aiReportResponseLimit: number;
  aiReportResponseUsed: number;
  dailyStats: WeeklyReportDailyStatDto[];
}

export type ReportMessageSenderType = "USER" | "AI" | "SYSTEM";
export type ReportMessageType = "TEXT" | "IMAGE";

export interface ReportMessageDto {
  messageId: number;
  senderType: ReportMessageSenderType;
  messageType: ReportMessageType;
  content: string | null;
  sentAt: string;
}

export interface ReportMessageListDto {
  content: ReportMessageDto[];
  nextCursor: number | null;
  hasNext: boolean;
  size: number;
}
