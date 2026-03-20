import { Suspense } from "react";
import { QueryClient, dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { AppShellPage } from "@/pages/app-shell";
import { serverFetch, serverTaskPath } from "@/shared/api/serverFetch";
import { dayPlanScheduleQueryKeys } from "@/entities/day-plan-schedule-core";
import { dayPlanPresenceQueryKeys } from "@/entities/day-plan-presence";

/** UTC 기준으로 KST(+9) 날짜 문자열을 반환한다. */
function getTodayKst(): string {
  const kst = new Date(Date.now() + 9 * 60 * 60 * 1000);
  const y = kst.getUTCFullYear();
  const m = String(kst.getUTCMonth() + 1).padStart(2, "0");
  const d = String(kst.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** KST 날짜 문자열로 해당 주의 일요일~토요일 범위를 반환한다. */
function getWeekRange(todayStr: string): { weekStart: string; weekEnd: string } {
  const fmt = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  const today = new Date(`${todayStr}T00:00:00`);
  const start = new Date(today);
  start.setDate(today.getDate() - today.getDay()); // 일요일
  const end = new Date(start);
  end.setDate(start.getDate() + 6); // 토요일

  return { weekStart: fmt(start), weekEnd: fmt(end) };
}

/** 데이터 prefetch 후 HydrationBoundary를 주입하는 async 서버 컴포넌트.
 *  Suspense로 감싸져 있으므로 await 중에도 서버는 fallback HTML을 먼저 전송한다. */
async function HomeWithData() {
  const queryClient = new QueryClient();
  const today = getTodayKst();
  const { weekStart, weekEnd } = getWeekRange(today);

  await Promise.allSettled([
    queryClient.prefetchQuery({
      queryKey: dayPlanScheduleQueryKeys.dayPlanSchedule(today, 1, 10),
      queryFn: () =>
        serverFetch(`${serverTaskPath("/day-plan/schedule")}?date=${today}&page=1&size=10`),
    }),
    queryClient.prefetchQuery({
      queryKey: dayPlanScheduleQueryKeys.currentSchedule(),
      queryFn: () => serverFetch(serverTaskPath("/schedule")),
    }),
    queryClient.prefetchQuery({
      queryKey: dayPlanPresenceQueryKeys.dayPlanPeriodSchedules(weekStart, weekEnd),
      queryFn: () =>
        serverFetch(
          `${serverTaskPath("/day-plan/period/schedules")}?startDate=${weekStart}&endDate=${weekEnd}`,
        ),
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AppShellPage />
    </HydrationBoundary>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<AppShellPage />}>
      <HomeWithData />
    </Suspense>
  );
}
