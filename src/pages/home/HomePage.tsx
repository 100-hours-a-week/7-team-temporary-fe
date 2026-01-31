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
      <HomePlanner onOpenPlannerEdit={handleOpenPlannerEdit} />
      <button
        type="button"
        aria-label="플래너 수정"
        onClick={handleOpenPlannerEdit}
        className="bg-ink-900 hover:bg-primary-500 fixed right-5 bottom-[calc(env(safe-area-inset-bottom)+15px)] z-[60] flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg"
      >
        <Icon
          name="edit"
          className="h-8 w-8"
          aria-hidden
        />
      </button>
    </div>
  );
}
