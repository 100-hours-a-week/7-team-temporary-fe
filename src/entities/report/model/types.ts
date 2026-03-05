export interface WeeklyReportDailyStatVM {
  date: string;
  day: string;
  achievementRate: number;
}

export interface WeeklyReportVM {
  reportId: number;
  startDate: string;
  endDate: string;
  aiReportResponseLimit: number;
  aiReportResponseUsed: number;
  dailyStats: WeeklyReportDailyStatVM[];
}

export type ReportMessageSenderTypeVM = "USER" | "AI" | "SYSTEM";
export type ReportMessageTypeVM = "TEXT" | "IMAGE";

export interface ReportMessageItemVM {
  messageId: number;
  senderType: ReportMessageSenderTypeVM;
  messageType: ReportMessageTypeVM;
  content: string;
  sentAt: string;
}

export interface ReportMessageListVM {
  content: ReportMessageItemVM[];
  nextCursor: number | null;
  hasNext: boolean;
  size: number;
}
