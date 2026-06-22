"use client";

import { Card } from "@/components/ui/card";
import { DashboardNav } from "@/components/layout/dashboard-nav";
import { StatusPill } from "@/components/ui/status-pill";
import { ContentForm } from "@/components/forms/content-form";
import { useLanguage } from "@/lib/i18n/context";

type Project = {
  id: string;
  title: string;
  summary: string;
  amount_needed: number | null;
  amount_raised: number | null;
  status: "pending" | "approved" | "rejected" | "published" | "draft";
};

export function DashboardProjectsClient({ projects }: { projects: Project[] | null }) {
  const { t } = useLanguage();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-8">
      <div className="grid gap-6 md:grid-cols-[240px_1fr]">
        <DashboardNav />
        <div className="space-y-5">
          <Card title={t.dashboard.createIdeaFunding} description={t.dashboard.ideaFundingModeration}>
            <ContentForm endpoint="/api/dashboard/projects" includeAmount actionLabel={t.dashboard.nav.ideaFunding} />
          </Card>
          <Card title={t.dashboard.yourIdeaFunding}>
            <div className="space-y-3">
              {projects?.map((project) => (
                <article key={project.id} className="rounded-lg border border-slate-200 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold text-slate-900">{project.title}</h3>
                    <StatusPill status={project.status} />
                  </div>
                  <p className="mt-1 text-sm text-slate-700">{project.summary}</p>
                  <p className="mt-1 text-sm text-slate-700">
                    {t.dashboard.raisedAzn} {Number(project.amount_raised ?? 0).toFixed(2)} / AZN {Number(project.amount_needed ?? 0).toFixed(2)}
                  </p>
                </article>
              ))}
              {!projects?.length ? <p className="text-sm text-slate-600">{t.dashboard.noIdeaPosts}</p> : null}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
