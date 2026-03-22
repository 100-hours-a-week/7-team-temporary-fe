import { useHomePlanStore, useDayPlanReflectionStatusQuery } from "@/entities/day-plan";
import { useStackPage } from "@/widgets/stack";
import { HomePlanner } from "@/widgets/home-planner";
import { FloatingActionButton, FloatingActionDock } from "@/shared/ui/button";

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
    void (async () => {
      const { PlannerEditStackPage } = await import("./ui/PlannerEditStackPage");
      push(<PlannerEditStackPage />);
    })();
  };

  const handleOpenRetroWrite = () => {
    void (async () => {
      const { RetroWriteStackPage } = await import("@/pages/retro/ui/RetroWriteStackPage");
      push(
        <RetroWriteStackPage
          baseDate={homeDate}
          dayPlanId={dayPlanId}
        />,
      );
    })();
  };

  const handleOpenWeeklyReport = () => {
    void (async () => {
      const { WeeklyReportStackPage } = await import("@/pages/report/WeeklyReportStackPage");
      push(<WeeklyReportStackPage baseDate={homeDate} />);
    })();
  };

  return (
    <div className="relative h-full pb-20">
      <HomePlanner
        enabled={enabled}
        onWeeklyReportClick={handleOpenWeeklyReport}
      />
      <FloatingActionDock className="flex flex-col items-end gap-3">
        <FloatingActionButton
          icon="retro"
          label="회고 작성"
          onClick={handleOpenRetroWrite}
          disabled={reflectionStatus?.alreadyWrote !== false || isReflectionFetching}
          className="disabled:bg-ink-500 disabled:text-white/70 disabled:opacity-100 disabled:shadow-none"
        />
        <FloatingActionButton
          icon="edit"
          label="플래너 수정"
          onClick={handleOpenPlannerEdit}
        />
      </FloatingActionDock>
    </div>
  );
}
