"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n/context";

type ModerationTable = "campaigns" | "projects" | "updates";
type ModerationStatus = "approved" | "rejected" | "published";

export function ModerationActions({ table, itemId }: { table: ModerationTable; itemId: string }) {
  const router = useRouter();
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function setStatus(status: ModerationStatus) {
    setError(null);
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/admin/moderation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          table,
          id: itemId,
          status,
          notes: status === "published" ? "Admin confirmed and published." : "Admin moderation action.",
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? t.admin.couldNotUpdateStatus);
        return;
      }

      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        onClick={() => setStatus("published")}
        disabled={isSubmitting}
        className="rounded-md bg-emerald-700 px-3 py-1.5 text-xs hover:bg-emerald-600 focus-visible:outline-emerald-700"
      >
        {t.admin.confirmPublish}
      </Button>
      <Button variant="danger" onClick={() => setStatus("rejected")} disabled={isSubmitting} className="text-xs">
        {t.admin.reject}
      </Button>
      {error ? <p className="text-xs text-rose-600">{error}</p> : null}
    </div>
  );
}
