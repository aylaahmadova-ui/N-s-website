"use client";

import {
  CheckCircle2,
  HeartHandshake,
  Lightbulb,
  Shirt,
  ShieldCheck,
  TrendingUp,
  HandCoins,
  HandHeart,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";

const OFFERING_ICONS = [HeartHandshake, Lightbulb, TrendingUp, Shirt, ShieldCheck];
const IMPACT_ICONS = [ShieldCheck, HandCoins, TrendingUp];
const IMPACT_TONES = ["bg-[#f6e8da]", "bg-[#f9eadf]", "bg-[#f7e7da]"];

export default function AboutPage() {
  const { t } = useLanguage();

  const impactLabels = [t.about.impactBadge1, t.about.impactBadge2, t.about.impactBadge3];

  return (
    <div className="min-h-screen bg-[#f6f1ea] px-6 py-14 text-[#3f2c1d] md:px-10">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-3xl border border-[#e3d5c7] bg-[linear-gradient(145deg,#fcf7f1,#f3e5d7)] p-7 shadow-[0_22px_50px_rgba(120,74,41,0.10)] md:p-10">
          <p className="inline-flex items-center gap-2 rounded-full border border-[#e0cfbc] bg-[#f7ebdf] px-4 py-1 text-xs font-bold uppercase tracking-[0.15em] text-[#9c5f30]">
            <CheckCircle2 className="h-4 w-4" />
            {t.about.badge}
          </p>

          <div className="mt-6 grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight text-[#5c3418] md:text-5xl">{t.about.title}</h1>

              <div className="mt-5 space-y-4 text-base leading-relaxed text-[#735847] md:text-lg">
                <p>{t.about.desc1}</p>
                <p>{t.about.desc2}</p>
                <p>{t.about.desc3}</p>
                <p className="font-semibold text-[#ad622e]">{t.about.descGoal}</p>
              </div>
            </div>

            <div className="space-y-4 lg:pt-10">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-1">
                {impactLabels.map((label, index) => {
                  const IconComponent = IMPACT_ICONS[index];
                  const tone = IMPACT_TONES[index];
                  return (
                    <div key={label} className={`rounded-2xl border border-[#e2d2c1] p-4 ${tone}`}>
                      <IconComponent className="h-5 w-5 text-[#a56131]" />
                      <p className="mt-2 text-sm font-semibold text-[#6f4629]">{label}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-3xl font-bold text-[#5b341a] md:text-4xl">{t.about.offerTitle}</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {t.about.offerings.map((item, index) => {
              const IconComponent = OFFERING_ICONS[index] || ShieldCheck;
              return (
                <article
                  key={item.title}
                  className="rounded-2xl border border-[#e3d5c7] bg-[#fffaf3] p-5 shadow-[0_12px_28px_rgba(113,73,43,0.08)]"
                >
                  <div className="flex items-start gap-3">
                    <div className="rounded-xl bg-[#f8ebdd] p-2">
                      <IconComponent className="h-5 w-5 text-[#a56131]" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-[#623a1f]">{item.title}</h3>
                      <p className="mt-1 text-sm text-[#775c49] md:text-base">{item.description}</p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="mt-10 rounded-3xl border border-[#e3d5c7] bg-[#fff9f2] p-6 md:p-8">
          <div className="flex flex-wrap items-center gap-4">
            <div className="rounded-full bg-[#f7ebdd] p-3">
              <HandHeart className="h-5 w-5 text-[#a56131]" />
            </div>
            <p className="text-base text-[#745947] md:text-lg">
              {t.about.footerQuote}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
