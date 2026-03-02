import { useHomePlanStore, useDayPlanReflectionStatusQuery } from "@/entities/day-plan";
import { RetroWriteStackPage } from "@/pages/retro";
import { WeeklyReportStackPage } from "@/pages/report";
import { useStackPage } from "@/widgets/stack";
import { HomePlanner } from "@/widgets/home-planner";
import { FloatingActionButton } from "@/shared/ui/button";
import { PlannerEditStackPage } from "./ui/PlannerEditStackPage";

interface HomePageProps {
  enabled?: boolean;
}

export function HomePage({ enabled = true }: HomePageProps) {
  const { push } = useStackPage();
  const homeDate = useHomePlanStore((state) => state.date);
  const dayPlanId = useHomePlanStore((state) => state.dayPlanId);
  const { data: reflectionStatus, isFetching: isReflectionFetching } =
    useDayPlanReflectionStatusQuery({ dayPlanId });

  const handleOpenPlannerEdit = () => {
    push(<PlannerEditStackPage />);
  };

  const handleOpenRetroWrite = () => {
    push(
      <RetroWriteStackPage
        baseDate={homeDate}
        dayPlanId={dayPlanId}
      />,
    );
  };

  const handleOpenWeeklyReport = () => {
    push(<WeeklyReportStackPage baseDate={homeDate} />);
  };

  return (
    <div className="relative h-full pb-20">
      <HomePlanner
        enabled={enabled}
        onWeeklyReportClick={handleOpenWeeklyReport}
      />
      <div className="pointer-events-none fixed bottom-0 left-1/2 z-[60] w-full max-w-[420px] -translate-x-1/2">
        <div className="pointer-events-auto absolute right-5 flex flex-col items-end gap-3">
          <FloatingActionButton
            icon="retro"
            label="회고 작성"
            onClick={handleOpenRetroWrite}
            disabled={reflectionStatus?.alreadyWrote !== false || isReflectionFetching}
          />
          <FloatingActionButton
            icon="edit"
            label="플래너 수정"
            onClick={handleOpenPlannerEdit}
          />
        </div>
      </div>
    </div>
  );
}
