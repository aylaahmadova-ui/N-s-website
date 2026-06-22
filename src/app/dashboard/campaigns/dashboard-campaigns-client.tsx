"use client";

import { Card } from "@/components/ui/card";
import { DashboardNav } from "@/components/layout/dashboard-nav";
import { StatusPill } from "@/components/ui/status-pill";
import { ContentForm } from "@/components/forms/content-form";
import { useLanguage } from "@/lib/i18n/context";

type Campaign = {
  id: string;
  title: string;
  summary: string;
  amount_needed: number | null;
  amount_raised: number | null;
  status: "pending" | "approved" | "rejected" | "published" | "draft";
};

export function DashboardCampaignsClient({ campaigns, adminUnlocked }: { campaigns: Campaign[] | null; adminUnlocked: boolean }) {
  const { t } = useLanguage();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-8">
      <div className="grid gap-6 md:grid-cols-[240px_1fr]">
        <DashboardNav />
        <div className="space-y-5">
          <Card title={t.dashboard.createDonationCall} description={t.dashboard.donationCallsModeration}>
            {adminUnlocked ? (
              <ContentForm endpoint="/api/dashboard/campaigns" includeAmount actionLabel={t.dashboard.submitDonationCall} />
            ) : (
              <p className="text-sm text-slate-600">{t.dashboard.adminUnlockRequiredCampaigns}</p>
            )}
          </Card>
          <Card title={t.dashboard.yourDonationCalls}>
            <div className="space-y-3">
              {campaigns?.map((campaign) => (
                <article key={campaign.id} className="rounded-lg border border-slate-200 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold text-slate-900">{campaign.title}</h3>
                    <StatusPill status={campaign.status} />
                  </div>
                  <p className="mt-1 text-sm text-slate-700">{campaign.summary}</p>
                  <p className="mt-1 text-sm text-slate-700">
                    {t.dashboard.raisedAzn} {Number(campaign.amount_raised ?? 0).toFixed(2)} / AZN {Number(campaign.amount_needed ?? 0).toFixed(2)}
                  </p>
                </article>
              ))}
              {!campaigns?.length ? <p className="text-sm text-slate-600">{t.dashboard.noDonationCalls}</p> : null}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
