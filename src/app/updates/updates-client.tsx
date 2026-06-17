"use client";

import Image from "next/image";
import { Sparkles, TrendingUp } from "lucide-react";
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
      <section className="relative overflow-hidden mb-8 rounded-3xl glass-panel p-6 shadow-sm md:p-8">
        <div className="absolute inset-0 z-0">
          <Image
            src="/updates_background.png"
            alt="Progress updates background illustration"
            fill
            className="object-cover opacity-[0.15]"
            priority
          />
        </div>
        <div className="relative z-10 flex items-start justify-between gap-4">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-[#e0cfbc] bg-[#f7ebdf]/95 px-3.5 py-1 text-xs font-bold uppercase tracking-[0.14em] text-[#9c5f30]">
              <Sparkles className="h-3.5 w-3.5" />
              {t.updates.title}
            </p>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-[#5c3418] md:text-4xl">{t.updates.title}</h1>
            <p className="mt-2 max-w-2xl text-base text-[#735847] md:text-lg">
              {t.updates.subtitle}
            </p>
          </div>
          <TrendingUp className="mt-1 hidden h-8 w-8 text-[#b97843] md:block animate-pulse" />
        </div>
      </section>

      {adminUnlocked ? (
        <section className="mb-8">
          <Card className="glass-panel" title={t.updates.postTitle} description={t.updates.postDesc}>
            <UpdateForm />
          </Card>
        </section>
      ) : null}

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {updates?.map((update: any) => {
          const { cleanDetails, imageUrl } = extractUpdateImage(update.details ?? "");
          return (
            <Card key={update.id} className="glass-panel glass-panel-hover flex flex-col justify-between" title={update.title} description={cleanDetails}>
              <div className="mt-auto pt-4 space-y-3">
                {imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={imageUrl} alt={update.title} className="mb-3 h-52 w-full rounded-2xl object-cover border border-[#e3d5c7]/40 shadow-sm" />
                ) : null}
                <div className="flex justify-between items-center text-xs text-[#775c49] border-t border-[#e3d5c7]/30 pt-2.5">
                  <span className="font-semibold text-[#623a1f]">
                    {t.updates.by}{" "}
                    {(Array.isArray(update.organizations)
                      ? update.organizations[0]?.display_name
                      : (update.organizations as { display_name?: string } | null)?.display_name) ?? "Organization"}
                  </span>
                  <span>
                    {update.created_at ? new Date(update.created_at).toLocaleDateString() : ""}
                  </span>
                </div>
              </div>
            </Card>
          );
        })}
        {!updates?.length ? <p className="text-slate-600">{t.updates.empty}</p> : null}
      </div>
    </div>
  );
}
