import type { ReactNode } from "react";

interface OnboardingQuestionLayoutProps {
  title: React.ReactNode;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function OnboardingQuestionLayout({
  title,
  description,
  children,
  className,
}: OnboardingQuestionLayoutProps) {
  return (
    <section className={`w-full ${className ?? ""}`.trim()}>
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl leading-snug font-bold text-neutral-900">{title}</h1>

        <p
          className={`min-h-[1.25rem] text-sm text-neutral-500 ${description ? "" : "invisible"}`.trim()}
        >
          {description ?? " "}
        </p>
      </div>

      <div className="flex flex-col gap-4">{children}</div>
    </section>
  );
}
