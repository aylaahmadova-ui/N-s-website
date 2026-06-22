"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { DashboardNav } from "@/components/layout/dashboard-nav";
import { StatusPill } from "@/components/ui/status-pill";
import { useLanguage } from "@/lib/i18n/context";

type Props = {
  organization: { display_name: string; description: string; status: string } | null;
  campaignCount: number;
  updateCount: number;
  isAdmin: boolean;
};

export function DashboardOverviewClient({ organization, campaignCount, updateCount, isAdmin }: Props) {
  const { t } = useLanguage();

  if (!organization && !isAdmin) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 md:px-8">
        <Card title={t.dashboard.completeOnboarding} description={t.dashboard.needOrgProfile}>
          <Link href="/apply" className="rounded-md bg-amber-700 px-4 py-2 text-sm font-semibold text-white">
            {t.dashboard.startApplication}
          </Link>
        </Card>
      </div>
    );
  }

  if (isAdmin) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 md:px-8">
        <Card title={t.dashboard.adminAccount} description={t.dashboard.adminFullAccess}>
          <Link href="/admin" className="rounded-md bg-amber-700 px-4 py-2 text-sm font-semibold text-white">
            {t.dashboard.openAdminDashboard}
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-8">
      <div className="grid gap-6 md:grid-cols-[240px_1fr]">
        <DashboardNav />
        <div className="space-y-5">
          <Card title={organization?.display_name} description={organization?.description}>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600">{t.dashboard.orgStatus}</span>
              <StatusPill status={(organization?.status ?? "pending") as "pending" | "approved" | "rejected" | "published" | "draft"} />
            </div>
            {organization?.status !== "approved" ? (
              <p className="mt-3 text-sm text-amber-700">{t.dashboard.mustBeApproved}</p>
            ) : null}
          </Card>

          <section className="grid gap-4 md:grid-cols-2">
            <Card title={t.dashboard.nav.donationCalls} description={`${campaignCount} ${t.dashboard.entries}`} />
            <Card title={t.dashboard.nav.updates} description={`${updateCount} ${t.dashboard.entries}`} />
          </section>
        </div>
      </div>
    </div>
  );
}
