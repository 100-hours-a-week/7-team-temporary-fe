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
