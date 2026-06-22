"use client";

import { Card } from "@/components/ui/card";
import { DashboardNav } from "@/components/layout/dashboard-nav";
import { ChildProfileForm } from "@/components/forms/child-profile-form";
import { useLanguage } from "@/lib/i18n/context";

type ChildProfile = {
  id: string;
  alias_name: string;
  age_range: string;
  talents: string;
  story_summary: string;
};

export function DashboardChildrenClient({ childProfiles }: { childProfiles: ChildProfile[] | null }) {
  const { t } = useLanguage();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-8">
      <div className="grid gap-6 md:grid-cols-[240px_1fr]">
        <DashboardNav />
        <div className="space-y-5">
          <Card title={t.dashboard.addChildProfileCard} description={t.dashboard.aliasNamesOnly}>
            <ChildProfileForm />
          </Card>
          <Card title={t.dashboard.childProfilesTitle} description={t.dashboard.anonymizedProfiles}>
            <div className="space-y-3">
              {childProfiles?.map((child) => (
                <article key={child.id} className="rounded-lg border border-slate-200 p-3">
                  <h3 className="font-semibold text-slate-900">{child.alias_name}</h3>
                  <p className="text-sm text-slate-600">{t.dashboard.ageRangeLabel} {child.age_range}</p>
                  <p className="text-sm text-slate-600">{t.dashboard.talentsLabel} {child.talents}</p>
                  <p className="mt-2 text-sm text-slate-700">{child.story_summary}</p>
                </article>
              ))}
              {!childProfiles?.length ? <p className="text-sm text-slate-600">{t.dashboard.noChildProfiles}</p> : null}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
