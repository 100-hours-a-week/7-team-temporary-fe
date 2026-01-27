import type { ReactNode } from "react";

interface OnboardingQuestionLayoutProps {
  title: React.ReactNode;
  description?: string;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}

export function OnboardingQuestionLayout({
  title,
  description,
  children,
  className,
  contentClassName,
}: OnboardingQuestionLayoutProps) {
  return (
    <section className={`w-full ${className ?? ""}`.trim()}>
      <div className="flex flex-col">
        <h1 className="max-w-[240px] text-2xl leading-snug font-bold text-neutral-900">{title}</h1>

        <p
          className={`min-h-[1.25rem] text-sm text-neutral-500 ${description ? "" : "invisible"}`.trim()}
        >
          {description ?? " "}
        </p>
      </div>

      <div className={`flex flex-col ${contentClassName ?? ""}`.trim()}>{children}</div>
    </section>
  );
}
