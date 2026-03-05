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
