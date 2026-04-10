import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Card({
  title,
  description,
  children,
  className,
}: {
  title?: string;
  description?: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <article className={cn("rounded-xl border border-slate-200 bg-white p-5 shadow-sm", className)}>
      {title ? <h3 className="text-lg font-semibold text-slate-900">{title}</h3> : null}
      {description ? <p className="mt-1 text-sm text-slate-600">{description}</p> : null}
      {children ? <div className="mt-4">{children}</div> : null}
    </article>
  );
}
