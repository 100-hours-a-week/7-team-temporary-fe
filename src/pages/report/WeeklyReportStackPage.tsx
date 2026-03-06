"use client";

import { useEffect, useState } from "react";

import {
  useWeeklyReportData,
  WeeklyAchievementSection,
  WeeklyButlerSection,
} from "@/features/report";
import { useStackPage } from "@/widgets/stack";

interface WeeklyReportStackPageProps {
  baseDate?: string | null;
}

export function WeeklyReportStackPage({ baseDate }: WeeklyReportStackPageProps) {
  const { setHeaderContent } = useStackPage();
  const [isEntered, setIsEntered] = useState(false);
  const { report, achievementPoints, periodLabel, isButlerInputEnabled, isLoading, isError } =
    useWeeklyReportData({
      baseDate,
    });

  useEffect(() => {
    setHeaderContent(
      <span className="text-base font-semibold text-black">주간 플래너 리포트</span>,
    );
    return () => setHeaderContent(null);
  }, [setHeaderContent]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setIsEntered(true);
    });

    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div
      className={`px-6 pt-4 pb-10 transition-all duration-500 ease-out ${
        isEntered ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
      }`}
    >
      <div
        className={`transition-all duration-500 ease-out ${
          isEntered ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
        }`}
      >
        <p className="text-base font-semibold text-black">{periodLabel}</p>
      </div>

      <section
        className={`mt-3 transition-all duration-500 ease-out ${
          isEntered ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
        }`}
        style={{ transitionDelay: "80ms" }}
      >
        <WeeklyAchievementSection
          points={achievementPoints}
          isLoading={isLoading}
          isError={isError}
        />
      </section>

      <section
        className={`transition-all duration-500 ease-out ${
          isEntered ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
        }`}
        style={{ transitionDelay: "130ms" }}
      >
        <WeeklyButlerSection
          reportId={report?.reportId ?? null}
          aiReportResponseLimit={report?.aiReportResponseLimit ?? null}
          aiReportResponseUsed={report?.aiReportResponseUsed ?? null}
          isInputEnabled={isButlerInputEnabled}
        />
      </section>
    </div>
  );
}
