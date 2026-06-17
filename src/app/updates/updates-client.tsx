"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card } from "@/components/ui/card";
import { UpdateForm } from "@/components/forms/update-form";
import { useLanguage } from "@/lib/i18n/context";

type UpdatesClientProps = {
  updates: any[] | null;
  adminUnlocked: boolean;
};

function extractUpdateImage(details: string) {
  const match = details.match(/\[image-url\](\S+)/);
  if (!match) return { cleanDetails: details, imageUrl: null as string | null };
  const cleanDetails = details.replace(/\n?\n?\[image-url\]\S+/, "").trim();
  return { cleanDetails, imageUrl: match[1] ?? null };
}

export function UpdatesClient({ updates, adminUnlocked }: UpdatesClientProps) {
  const { t } = useLanguage();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-8">
      <h1 className="text-3xl font-semibold text-amber-900">{t.updates.title}</h1>
      <p className="mt-2 text-slate-600">{t.updates.subtitle}</p>
      {adminUnlocked ? (
        <section className="mt-6">
          <Card title={t.updates.postTitle} description={t.updates.postDesc}>
            <UpdateForm />
          </Card>
        </section>
      ) : null}
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {updates?.map((update: any) => {
          const { cleanDetails, imageUrl } = extractUpdateImage(update.details ?? "");
          return (
            <Card key={update.id} title={update.title} description={cleanDetails}>
              {imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imageUrl} alt={update.title} className="mb-3 h-52 w-full rounded-lg object-cover" />
              ) : null}
              <p className="text-sm text-slate-600">
                {t.updates.by}{" "}
                {(Array.isArray(update.organizations)
                  ? update.organizations[0]?.display_name
                  : (update.organizations as { display_name?: string } | null)?.display_name) ?? "Organization"}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {update.created_at ? new Date(update.created_at).toLocaleDateString() : ""}
              </p>
            </Card>
          );
        })}
        {!updates?.length ? <p className="text-slate-600">{t.updates.empty}</p> : null}
      </div>
    </div>
  );
}
