"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { Shirt, Sparkles } from "lucide-react";
import { CampaignQuickForm } from "@/components/forms/campaign-quick-form";
import { CampaignCard } from "@/components/campaigns/campaign-card";
import { useLanguage } from "@/lib/i18n/context";

type ClothesClientProps = {
  campaigns: any[] | null;
  adminUnlocked: boolean;
};

export function ClothesClient({ campaigns, adminUnlocked }: ClothesClientProps) {
  const { t } = useLanguage();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-8">
      <section className="mb-8 rounded-3xl border border-[#e3d5c7] bg-gradient-to-br from-[#fff8f1] via-[#fff4e9] to-[#fef9f5] p-6 shadow-sm md:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-[#e6d5c3] bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#8a5832]">
              <Sparkles className="h-3.5 w-3.5" />
              {t.clothes.badge}
            </p>
            <h1 className="mt-4 text-3xl font-semibold text-amber-900 md:text-4xl">{t.clothes.title}</h1>
            <p className="mt-2 max-w-2xl text-base text-[#6d5b4b] md:text-lg">
              {t.clothes.subtitle}
            </p>
          </div>
          <Shirt className="mt-1 hidden h-8 w-8 text-[#b97843] md:block" />
        </div>
      </section>

      {adminUnlocked ? (
        <section className="mb-8">
          <CampaignQuickForm hideFundingGoal campaignType="clothes" />
        </section>
      ) : null}

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {campaigns?.map((campaign: any) => (
          <CampaignCard
            key={campaign.id}
            id={campaign.id}
            title={campaign.title}
            summary={campaign.summary}
            imageUrl={campaign.image_url}
            contactNumber={campaign.contact_number}
            isDone={Boolean(campaign.is_done)}
            amountNeeded={Number(campaign.amount_needed ?? 0)}
            amountRaised={Number(campaign.amount_raised ?? 0)}
            adminUnlocked={adminUnlocked}
            clothesOnly
          />
        ))}
      </div>

      {!campaigns?.length ? (
        <div className="mt-6 rounded-2xl border border-dashed border-[#decab7] bg-[#fffaf6] px-4 py-6 text-center text-[#7b6857]">
          {t.clothes.empty}
        </div>
      ) : null}
    </div>
  );
}
