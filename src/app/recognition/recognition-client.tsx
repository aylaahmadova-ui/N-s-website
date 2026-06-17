"use client";

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
        <section className="rounded-2xl border border-[#e3d5c7] bg-[#fcf7f1] p-6 md:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#9c5f30]">{t.recognition.label}</p>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-[#5c3418] md:text-5xl">{t.recognition.title}</h1>
          <p className="mt-3 max-w-3xl text-sm text-[#6f5442] md:text-base">
            {t.recognition.subtitle}
          </p>
        </section>

        <Card title={t.recognition.cardTitle}>
          {rankedDonors.length ? (
            <div className="space-y-3">
              {rankedDonors.map((donor, index) => (
                <article
                  key={donor.key}
                  className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:grid-cols-[auto_1fr_auto] sm:items-center"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-100 text-sm font-semibold text-amber-900">
                    #{index + 1}
                  </div>
                  <h2 className="text-lg font-semibold text-slate-900">{donor.donorName}</h2>
                  <p className="text-base font-semibold text-amber-900">{formatAmount(donor.totalAmount)}</p>
                </article>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-600">{t.recognition.empty}</p>
          )}
        </Card>
      </div>
    </div>
  );
}
