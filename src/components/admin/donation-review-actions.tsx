"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";

type Props = {
  donationId: string;
  receiptUrl: string | null;
};

export function DonationReviewActions({ donationId, receiptUrl }: Props) {
  const router = useRouter();
  const { t } = useLanguage();
  const [loading, setLoading] = useState<"approved" | "rejected" | null>(null);
  const [done, setDone] = useState<"approved" | "rejected" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handle(action: "approved" | "rejected") {
    setLoading(action);
    setError(null);
    try {
      const res = await fetch("/api/admin/donations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ donationId, action }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? t.admin.actionFailed);
      } else {
        setDone(action);
        router.refresh();
      }
    } catch {
      setError(t.admin.networkError);
    } finally {
      setLoading(null);
    }
  }

  if (done) {
    return (
      <p className={`text-xs font-semibold ${done === "approved" ? "text-emerald-700" : "text-rose-600"}`}>
        {done === "approved" ? t.admin.approved : t.admin.rejected}
      </p>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {receiptUrl && (
        <a
          href={receiptUrl}
          target="_blank"
          rel="noreferrer"
          className="rounded-md border border-[#d7bca5] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#7d4d2a] hover:bg-[#fff5eb]"
        >
          {t.admin.viewReceipt}
        </a>
      )}
      <button
        type="button"
        disabled={!!loading}
        onClick={() => handle("approved")}
        className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
      >
        {loading === "approved" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle className="h-3.5 w-3.5" />}
        {t.admin.approve}
      </button>
      <button
        type="button"
        disabled={!!loading}
        onClick={() => handle("rejected")}
        className="inline-flex items-center gap-1 rounded-md bg-rose-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-50"
      >
        {loading === "rejected" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <XCircle className="h-3.5 w-3.5" />}
        {t.admin.reject}
      </button>
      {error && <p className="text-xs text-rose-600">{error}</p>}
    </div>
  );
}
