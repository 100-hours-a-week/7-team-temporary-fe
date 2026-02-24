import { cn } from "@/shared/lib";

interface EmptyStateCardProps {
  message: string;
  className?: string;
}

export function EmptyStateCard({ message, className }: EmptyStateCardProps) {
  return (
    <div className={cn("rounded-2xl px-4 py-6 text-center text-sm text-neutral-500", className)}>
      {message}
    </div>
  );
}
