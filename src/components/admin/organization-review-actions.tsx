"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, XCircle, RotateCcw, Undo2, Loader2 } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";

type Status = "approved" | "rejected" | "pending";

type Props = {
  organizationId: string;
  currentStatus: string;
};

export function OrganizationReviewActions({ organizationId, currentStatus }: Props) {
  const router = useRouter();
  const { t } = useLanguage();
  const [loading, setLoading] = useState<Status | null>(null);
  const [confirming, setConfirming] = useState<Status | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function setStatus(status: Status) {
    setLoading(status);
    setError(null);
    try {
      const response = await fetch("/api/admin/organizations/" + organizationId + "/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(data.error ?? t.admin.couldNotUpdateStatus);
      } else {
        setConfirming(null);
        router.refresh();
      }
    } catch {
      setError(t.admin.networkError);
    } finally {
      setLoading(null);
    }
  }

  // Destructive transitions ask twice; approving straight from the queue does not.
  function request(status: Status, needsConfirm: boolean) {
    if (needsConfirm && confirming !== status) {
      setConfirming(status);
      setError(null);
      return;
    }
    void setStatus(status);
  }

  const busy = loading !== null;
  const base =
    "inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-semibold text-white disabled:opacity-50";

  function icon(status: Status, fallback: React.ReactNode) {
    return loading === status ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : fallback;
  }

  const buttons: React.ReactNode[] = [];

  if (currentStatus === "pending" || currentStatus === "rejected") {
    buttons.push(
      <button
        key="approve"
        type="button"
        disabled={busy}
        onClick={() => request("approved", false)}
        className={`${base} bg-emerald-600 hover:bg-emerald-700`}
      >
        {icon("approved", <CheckCircle className="h-3.5 w-3.5" />)}
        {t.admin.approve}
      </button>,
    );
  }

  if (currentStatus === "pending") {
    buttons.push(
      <button
        key="reject"
        type="button"
        disabled={busy}
        onClick={() => request("rejected", true)}
        className={`${base} bg-rose-600 hover:bg-rose-700`}
      >
        {icon("rejected", <XCircle className="h-3.5 w-3.5" />)}
        {confirming === "rejected" ? t.admin.confirmYes : t.admin.reject}
      </button>,
    );
  }

  if (currentStatus === "approved") {
    buttons.push(
      <button
        key="revoke"
        type="button"
        disabled={busy}
        onClick={() => request("pending", true)}
        className={`${base} bg-rose-600 hover:bg-rose-700`}
      >
        {icon("pending", <Undo2 className="h-3.5 w-3.5" />)}
        {confirming === "pending" ? t.admin.confirmYes : t.admin.revokeApproval}
      </button>,
    );
  }

  if (currentStatus === "rejected") {
    buttons.push(
      <button
        key="reconsider"
        type="button"
        disabled={busy}
        onClick={() => request("pending", false)}
        className={`${base} bg-amber-600 hover:bg-amber-700`}
      >
        {icon("pending", <RotateCcw className="h-3.5 w-3.5" />)}
        {t.admin.reconsider}
      </button>,
    );
  }

  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap items-center gap-2">
        {buttons}
        {confirming ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => setConfirming(null)}
            className="rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            {t.admin.cancel}
          </button>
        ) : null}
      </div>
      {confirming ? <p className="text-xs font-medium text-rose-700">{t.admin.confirmAction}</p> : null}
      {error ? <p className="text-xs text-rose-600">{error}</p> : null}
    </div>
  );
}
