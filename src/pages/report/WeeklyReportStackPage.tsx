"use client";

import { useEffect, useState } from "react";

import { getWeeklyReportPeriodLabel, WeeklyAchievementSection } from "@/features/report";
import { useStackPage } from "@/widgets/stack";

interface WeeklyReportStackPageProps {
  baseDate?: string | null;
}

export function WeeklyReportStackPage({ baseDate }: WeeklyReportStackPageProps) {
  const { setHeaderContent } = useStackPage();
  const [isEntered, setIsEntered] = useState(false);
  const reportPeriodLabel = getWeeklyReportPeriodLabel(baseDate);

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
        <p className="text-base font-semibold text-black">{reportPeriodLabel}</p>
      </div>

      <section
        className={`mt-3 transition-all duration-500 ease-out ${
          isEntered ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
        }`}
        style={{ transitionDelay: "80ms" }}
      >
        <WeeklyAchievementSection />
      </section>

      <div
        className={`mt-4 transition-all duration-500 ease-out ${
          isEntered ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
        }`}
        style={{ transitionDelay: "130ms" }}
      >
        <p className="text-base font-semibold text-black">주간 리포트 화면을 준비 중입니다.</p>
      </div>
    </div>
  );
}
