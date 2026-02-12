import { cn } from "@/shared/lib";

interface PublicPageHeaderProps {
  title: string;
  className?: string;
}

export function PublicPageHeader({ title, className }: PublicPageHeaderProps) {
  return (
    <header
      className={cn(
        "grid h-[52px] w-full grid-cols-[auto_1fr_auto] items-center px-7 py-3",
        className,
      )}
    >
      <span className="text-ink-900 text-xl font-semibold">{title}</span>
      <div />
    </header>
  );
}
