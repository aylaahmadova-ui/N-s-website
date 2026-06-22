"use client";

import { Card } from "@/components/ui/card";
import { StatusPill } from "@/components/ui/status-pill";
import { OrganizationReviewActions } from "@/components/admin/organization-review-actions";
import { ModerationActions } from "@/components/admin/moderation-actions";
import { DonationReviewActions } from "@/components/admin/donation-review-actions";
import { useLanguage } from "@/lib/i18n/context";

type ModerationItem = {
  table: "campaigns" | "projects" | "updates";
  id: string;
  title: string;
  status: "pending" | "approved" | "rejected" | "published" | "draft";
};

type Organization = {
  id: string;
  display_name: string;
  description: string;
  status: "pending" | "approved" | "rejected" | "published" | "draft";
};

type PendingDonation = {
  id: string;
  donorName: string;
  amount: number;
  campaignTitle: string;
  receiptUrl: string | null;
  createdAt: string;
};

type Props = {
  organizations: Organization[];
  moderationQueue: ModerationItem[];
  pendingDonations: PendingDonation[];
};

export function AdminClient({ organizations, moderationQueue, pendingDonations }: Props) {
  const { t } = useLanguage();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-8">
      <h1 className="text-3xl font-semibold text-amber-900">{t.admin.title}</h1>
      <p className="mt-2 text-slate-600">{t.admin.subtitle}</p>

      <section className="mt-8">
        <Card
          title={`${t.admin.donationReceiptsTitle} (${pendingDonations.length} ${t.admin.pendingBadge})`}
          description={t.admin.donationReceiptsDesc}
        >
          <div className="space-y-3">
            {pendingDonations.map((d) => (
              <article key={d.id} className="rounded-lg border border-slate-200 p-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-slate-900">{d.donorName}</p>
                    <p className="text-xs text-slate-500">{d.campaignTitle}</p>
                    <p className="mt-0.5 text-sm font-bold text-amber-900">AZN {d.amount.toFixed(2)}</p>
                    <p className="text-xs text-slate-400">{new Date(d.createdAt).toLocaleString()}</p>
                  </div>
                  <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">{t.admin.pendingBadge}</span>
                </div>
                <div className="mt-3">
                  <DonationReviewActions donationId={d.id} receiptUrl={d.receiptUrl} />
                </div>
              </article>
            ))}
            {!pendingDonations.length ? <p className="text-sm text-slate-600">{t.admin.noPendingReceipts}</p> : null}
          </div>
        </Card>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-2">
        <Card title={t.admin.orgApprovalsTitle} description={t.admin.orgApprovalsDesc}>
          <div className="space-y-3">
            {organizations.map((org) => (
              <article key={org.id} className="rounded-lg border border-slate-200 p-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{org.display_name}</h3>
                  <StatusPill status={org.status} />
                </div>
                <p className="mt-1 text-sm text-slate-700">{org.description}</p>
                {org.status === "pending" ? (
                  <div className="mt-3">
                    <OrganizationReviewActions organizationId={org.id} />
                  </div>
                ) : null}
              </article>
            ))}
            {!organizations.length ? <p className="text-sm text-slate-600">{t.admin.noOrganizations}</p> : null}
          </div>
        </Card>

        <Card title={t.admin.moderationQueueTitle} description={t.admin.moderationQueueDesc}>
          <div className="space-y-3">
            {moderationQueue.map((item) => (
              <article key={item.id} className="rounded-lg border border-slate-200 p-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="font-medium text-slate-900">{item.title}</p>
                    <p className="mt-1 text-xs uppercase tracking-wide text-slate-500">{item.table.slice(0, -1)}</p>
                  </div>
                  <StatusPill status={item.status} />
                </div>
                <div className="mt-3">
                  <ModerationActions table={item.table} itemId={item.id} />
                </div>
              </article>
            ))}
            {!moderationQueue.length ? <p className="text-sm text-slate-600">{t.admin.noPendingContent}</p> : null}
          </div>
        </Card>
      </section>
    </div>
  );
}
