"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n/context";

export function OrganizationReviewActions({ organizationId }: { organizationId: string }) {
  const router = useRouter();
  const { t } = useLanguage();

  async function setStatus(status: "approved" | "rejected") {
    const response = await fetch("/api/admin/organizations/" + organizationId + "/status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    if (response.ok) {
      router.refresh();
    }
  }

  return (
    <div className="flex gap-2">
      <Button onClick={() => setStatus("approved")} className="text-xs">
        {t.admin.approve}
      </Button>
      <Button variant="danger" onClick={() => setStatus("rejected")} className="text-xs">
        {t.admin.reject}
      </Button>
    </div>
  );
}
