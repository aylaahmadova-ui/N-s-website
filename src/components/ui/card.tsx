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
    <article className={cn("glass-panel rounded-3xl p-6 shadow-sm", className)}>
      {title ? <h3 className="text-xl font-bold text-[#5c3418]">{title}</h3> : null}
      {description ? <p className="mt-1.5 text-sm text-[#735847]">{description}</p> : null}
      {children ? <div className="mt-4">{children}</div> : null}
    </article>
  );
}
