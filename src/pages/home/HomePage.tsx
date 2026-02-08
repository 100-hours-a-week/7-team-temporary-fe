import { useStackPage } from "@/widgets/stack";
import { HomePlanner } from "@/features/home";
import { Icon } from "@/shared/ui/icon";
import { PlannerEditStackPage } from "./ui/PlannerEditStackPage";

export function HomePage() {
  const { push } = useStackPage();

  const handleOpenPlannerEdit = () => {
    push(<PlannerEditStackPage />);
  };

  return (
    <div className="relative h-full pb-20">
      <HomePlanner />
      <div className="pointer-events-none fixed bottom-0 left-1/2 z-[60] w-full max-w-[420px] -translate-x-1/2">
        <button
          type="button"
          aria-label="플래너 수정"
          onClick={handleOpenPlannerEdit}
          className="bg-ink-900 hover:bg-primary-500 pointer-events-auto absolute right-5 bottom-[calc(env(safe-area-inset-bottom)+110px)] flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg"
        >
          <Icon
            name="edit"
            className="h-8 w-8"
            aria-hidden
          />
        </button>
      </div>
    </div>
  );
}
