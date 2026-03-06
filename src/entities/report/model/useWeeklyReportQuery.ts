import { useQuery } from "@tanstack/react-query";

import { fetchWeeklyReport } from "../api";

import { reportQueryKeys } from "./queryKeys";
import { toWeeklyReportModel } from "./weeklyReport.mapper";

interface UseWeeklyReportQueryOptions {
  startDate: string;
  enabled?: boolean;
}

export function useWeeklyReportQuery({ startDate, enabled = true }: UseWeeklyReportQueryOptions) {
  return useQuery({
    queryKey: reportQueryKeys.weekly(startDate),
    queryFn: ({ signal }) => fetchWeeklyReport({ startDate, signal }),
    select: toWeeklyReportModel,
    enabled: enabled && startDate.length > 0,
  });
}
