import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function Input({ label, className, error, id, ...props }: InputProps) {
  const fieldId = id ?? props.name;

  return (
    <div className="space-y-1">
      <label htmlFor={fieldId} className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        id={fieldId}
        className={cn(
          "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-200",
          className,
        )}
        {...props}
      />
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
    </div>
  );
}
