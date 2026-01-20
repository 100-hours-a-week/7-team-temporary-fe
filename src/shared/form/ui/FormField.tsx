import type { ReactNode } from "react";

interface FormFieldProps {
  label: string;
  error?: string;
  children: ReactNode;
}

export function FormField({ label, error, children }: FormFieldProps) {
  return (
    <div className="flex w-full flex-col gap-1">
      <label className="text-sm font-medium">{label}</label>

      <div className={error ? "rounded-md border border-red-500" : undefined}>
        {children}
      </div>

      {error && (
        <span className="text-xs text-red-500">
          {error}
        </span>
      )}
    </div>
  );
}
