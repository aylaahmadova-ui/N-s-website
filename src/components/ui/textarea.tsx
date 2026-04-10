import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export function Textarea({ label, className, error, id, ...props }: TextareaProps) {
  const fieldId = id ?? props.name;

  return (
    <div className="space-y-1">
      <label htmlFor={fieldId} className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      <textarea
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
