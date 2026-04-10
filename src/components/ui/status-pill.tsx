import { cn } from "@/lib/utils";

type Status = "pending" | "approved" | "rejected" | "published" | "draft";

const statusStyles: Record<Status, string> = {
  pending: "bg-amber-100 text-amber-800",
  approved: "bg-orange-100 text-orange-800",
  rejected: "bg-rose-100 text-rose-700",
  published: "bg-sky-100 text-sky-800",
  draft: "bg-slate-100 text-slate-700",
};

export function StatusPill({ status }: { status: Status }) {
  return (
    <span className={cn("rounded-full px-2 py-1 text-xs font-semibold capitalize", statusStyles[status])}>
      {status}
    </span>
  );
}
