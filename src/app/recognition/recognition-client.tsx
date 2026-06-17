"use client";

import Image from "next/image";
import { Award, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/lib/i18n/context";

type RankedDonor = {
  key: string;
  donorName: string;
  totalAmount: number;
};

type RecognitionClientProps = {
  rankedDonors: RankedDonor[];
};

export function RecognitionClient({ rankedDonors }: RecognitionClientProps) {
  const { t } = useLanguage();

  function formatAmount(amount: number) {
    return `AZN ${amount.toFixed(2)}`;
  }

  return (
    <div className="min-h-screen bg-[#f6f1ea] px-4 py-10 text-[#3f2c1d] md:px-8">
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <section className="relative overflow-hidden rounded-3xl glass-panel p-6 shadow-sm md:p-8">
          <div className="absolute inset-0 z-0">
            <Image
              src="/recognition_background.png"
              alt="Leaderboard recognition background illustration"
              fill
              className="object-cover opacity-[0.15]"
              priority
            />
          </div>
          <div className="relative z-10 flex items-start justify-between gap-4">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-[#e0cfbc] bg-[#f7ebdf]/95 px-3.5 py-1 text-xs font-bold uppercase tracking-[0.14em] text-[#9c5f30]">
                <Sparkles className="h-3.5 w-3.5" />
                {t.recognition.label}
              </p>
              <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-[#5c3418] md:text-5xl">{t.recognition.title}</h1>
              <p className="mt-3 max-w-3xl text-base text-[#735847] md:text-lg">
                {t.recognition.subtitle}
              </p>
            </div>
            <Award className="mt-1 hidden h-8 w-8 text-[#b97843] md:block animate-pulse" />
          </div>
        </section>

        <Card className="glass-panel" title={t.recognition.cardTitle}>
          {rankedDonors.length ? (
            <div className="space-y-3">
              {rankedDonors.map((donor, index) => (
                <article
                  key={donor.key}
                  className="grid gap-3 rounded-2xl border border-[#e3d5c7]/50 bg-white/70 p-4 sm:grid-cols-[auto_1fr_auto] sm:items-center glass-panel-hover"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f8ebdd] text-sm font-semibold text-[#a56131]">
                    #{index + 1}
                  </div>
                  <h2 className="text-lg font-bold text-[#5c3418]">{donor.donorName}</h2>
                  <p className="text-base font-extrabold text-[#a56131]">{formatAmount(donor.totalAmount)}</p>
                </article>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#735847]">{t.recognition.empty}</p>
          )}
        </Card>
      </div>
    </div>
  );
}
