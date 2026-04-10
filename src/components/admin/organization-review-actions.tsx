"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function OrganizationReviewActions({ organizationId }: { organizationId: string }) {
  const router = useRouter();

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
        Approve
      </Button>
      <Button variant="danger" onClick={() => setStatus("rejected")} className="text-xs">
        Reject
      </Button>
    </div>
  );
}
