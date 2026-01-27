import { cn } from "@/shared/lib";

interface OnboardingStepBarProps {
  step: number;
  totalSteps: number;
}

export function OnboardingStepBar({ step, totalSteps }: OnboardingStepBarProps) {
  if (totalSteps <= 0) {
    return null;
  }

  return (
    <div className="flex w-full items-center gap-1.5">
      {Array.from({ length: totalSteps }).map((_, index) => (
        <div
          key={`onboarding-step-${index}`}
          className={cn(
            "h-1.5 flex-1 rounded-full transition-colors",
            index <= step ? "bg-red-400" : "bg-neutral-200",
          )}
        />
      ))}
    </div>
  );
}
