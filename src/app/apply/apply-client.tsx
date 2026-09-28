"use client";

import { OrganizationApplicationForm } from "@/components/forms/organization-application-form";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/lib/i18n/context";

export function ApplyClient() {
  const { t } = useLanguage();
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Card title={t.apply.title} description={t.apply.description}>
        <OrganizationApplicationForm />
      </Card>
    </div>
  );
}
