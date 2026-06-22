"use client";

import { Card } from "@/components/ui/card";
import { DashboardNav } from "@/components/layout/dashboard-nav";
import { StatusPill } from "@/components/ui/status-pill";
import { UpdateForm } from "@/components/forms/update-form";
import { useLanguage } from "@/lib/i18n/context";

type Update = {
  id: string;
  title: string;
  details: string;
  status: "pending" | "approved" | "rejected" | "published" | "draft";
};

export function DashboardUpdatesClient({ updates, adminUnlocked }: { updates: Update[] | null; adminUnlocked: boolean }) {
  const { t } = useLanguage();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-8">
      <div className="grid gap-6 md:grid-cols-[240px_1fr]">
        <DashboardNav />
        <div className="space-y-5">
          <Card title={t.dashboard.postProgressUpdate} description={t.dashboard.adminOnlyUpdates}>
            {adminUnlocked ? <UpdateForm /> : <p className="text-sm text-slate-600">{t.dashboard.adminUnlockRequiredUpdates}</p>}
          </Card>
          <Card title={t.dashboard.yourUpdates}>
            <div className="space-y-3">
              {updates?.map((update) => (
                <article key={update.id} className="rounded-lg border border-slate-200 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold text-slate-900">{update.title}</h3>
                    <StatusPill status={update.status} />
                  </div>
                  <p className="mt-1 text-sm text-slate-700">{update.details}</p>
                </article>
              ))}
              {!updates?.length ? <p className="text-sm text-slate-600">{t.dashboard.noUpdates}</p> : null}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
