import { useHomePlanStore } from "@/entities/day-plan";
import { RetroWriteStackPage } from "@/pages/retro";
import { WeeklyReportStackPage } from "@/pages/report";
import { useStackPage } from "@/widgets/stack";
import { HomePlanner } from "@/widgets/home-planner";
import { Icon } from "@/shared/ui/icon";
import { PlannerEditStackPage } from "./ui/PlannerEditStackPage";

interface HomePageProps {
  enabled?: boolean;
}

export function HomePage({ enabled = true }: HomePageProps) {
  const { push } = useStackPage();
  const homeDate = useHomePlanStore((state) => state.date);
  const dayPlanId = useHomePlanStore((state) => state.dayPlanId);

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
    push(<WeeklyReportStackPage />);
  };

  return (
    <div className="relative h-full pb-20">
      <HomePlanner
        enabled={enabled}
        onWeeklyReportClick={handleOpenWeeklyReport}
      />
      <div className="pointer-events-none fixed bottom-0 left-1/2 z-[60] w-full max-w-[420px] -translate-x-1/2">
        <div className="pointer-events-auto absolute right-5 bottom-[calc(env(safe-area-inset-bottom)+110px)] flex flex-col items-end gap-3">
          <button
            type="button"
            aria-label="회고 작성"
            onClick={handleOpenRetroWrite}
            className="bg-ink-900 hover:bg-primary-500 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg"
          >
            <Icon
              name="retro"
              className="h-8 w-8"
              aria-hidden
            />
          </button>
          <button
            type="button"
            aria-label="플래너 수정"
            onClick={handleOpenPlannerEdit}
            className="bg-ink-900 hover:bg-primary-500 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg"
          >
            <Icon
              name="edit"
              className="h-8 w-8"
              aria-hidden
            />
          </button>
        </div>
      </div>
    </div>
  );
}
