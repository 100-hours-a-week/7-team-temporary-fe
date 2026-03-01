interface WeeklyAchievementSummaryProps {
  bestDay: string;
  averageRate: number;
}

export function WeeklyAchievementSummary({ bestDay, averageRate }: WeeklyAchievementSummaryProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="text-ink-900/45 text-sm font-semibold">이번주 요약</p>
        <p className="mt-1 text-base font-semibold text-black">
          <span className="text-primary-500">{bestDay}요일</span> 달성률이 가장 높았어요
        </p>
      </div>
      <div className="bg-primary-100 rounded-xl px-3 py-2 text-right">
        <p className="text-primary-600 text-xs font-semibold">평균 달성률</p>
        <p className="text-primary-700 mt-0.5 text-base font-bold">{averageRate}%</p>
      </div>
    </div>
  );
}
