"use client";

import { Card } from "@/components/ui/card";
import { DashboardNav } from "@/components/layout/dashboard-nav";
import { useLanguage } from "@/lib/i18n/context";

type RankedDonor = {
  donorId: string;
  donorName: string;
  donationCount: number;
  totalAmount: number;
};

type Props = {
  donorRows: RankedDonor[];
  visibleTotal: number;
  anonymousTotal: number;
  anonymousDonationCount: number;
};

function formatAmount(amount: number) {
  return `AZN ${amount.toFixed(2)}`;
}

export function DashboardRecognitionClient({ donorRows, visibleTotal, anonymousTotal, anonymousDonationCount }: Props) {
  const { t } = useLanguage();

  function formatDonationCount(count: number) {
    return `${count} ${count === 1 ? t.dashboard.donation : t.dashboard.donations}`;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-8">
      <div className="grid gap-6 md:grid-cols-[240px_1fr]">
        <DashboardNav />
        <div className="space-y-5">
          <Card title={t.dashboard.donorRecognition} description={t.dashboard.donorRecognitionDesc}>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm text-slate-600">{t.dashboard.recognizedDonors}</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">{donorRows.length}</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm text-slate-600">{t.dashboard.visibleDonatedAmount}</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">{formatAmount(visibleTotal)}</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm text-slate-600">{t.dashboard.anonymousDonationsLabel}</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">{formatAmount(anonymousTotal)}</p>
                <p className="mt-1 text-xs text-slate-500">{formatDonationCount(anonymousDonationCount)} {t.dashboard.keptPrivate}</p>
              </div>
            </div>
          </Card>

          <Card title={t.dashboard.rankedSupporters}>
            {donorRows.length ? (
              <div className="space-y-3">
                {donorRows.map((donor, index) => (
                  <article key={donor.donorId} className="grid gap-3 rounded-lg border border-slate-200 p-4 sm:grid-cols-[auto_1fr_auto] sm:items-center">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-100 text-sm font-semibold text-amber-900">
                      #{index + 1}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{donor.donorName}</h3>
                      <p className="mt-1 text-sm text-slate-600">{formatDonationCount(donor.donationCount)}</p>
                    </div>
                    <p className="text-base font-semibold text-amber-900">{formatAmount(donor.totalAmount)}</p>
                  </article>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-600">
                {anonymousDonationCount ? t.dashboard.allAnonymousMessage : t.dashboard.noDonorEntries}
              </p>
            )}
            <p className="mt-4 text-xs text-slate-500">{t.dashboard.anonymousGiftsNote}</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
