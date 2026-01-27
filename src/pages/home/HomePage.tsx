import { useStackPage } from "@/widgets/stack";
import { HomePlanner } from "@/features/home";
import { PlannerEditStackPage } from "./ui/PlannerEditStackPage";

export function HomePage() {
  const { push } = useStackPage();

  const handleOpenPlannerEdit = () => {
    push(<PlannerEditStackPage />);
  };

  return <HomePlanner onOpenPlannerEdit={handleOpenPlannerEdit} />;
}
