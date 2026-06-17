"use client";

import Image from "next/image";
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
        <section className="relative overflow-hidden rounded-3xl glass-panel p-7 shadow-[0_22px_50px_rgba(120,74,41,0.06)] md:p-10 animate-in fade-in">
          <div className="absolute inset-0 z-0">
            <Image
              src="/about_background.png"
              alt="About page background illustration"
              fill
              className="object-cover opacity-[0.15]"
              priority
            />
          </div>
          <div className="relative z-10">
            <p className="inline-flex items-center gap-2 rounded-full border border-[#e0cfbc] bg-[#f7ebdf]/95 px-4 py-1 text-xs font-bold uppercase tracking-[0.15em] text-[#9c5f30]">
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
                <p className="font-semibold text-[#a56131]">{t.about.descGoal}</p>
              </div>
            </div>

            <div className="space-y-4 lg:pt-10">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-1">
                {impactLabels.map((label, index) => {
                  const IconComponent = IMPACT_ICONS[index];
                  return (
                    <div key={label} className="rounded-2xl border border-[#e3d5c7]/50 bg-white/70 p-4 shadow-sm flex items-center gap-3 md:gap-4 glass-panel-hover">
                      <div className="rounded-xl bg-[#f8ebdd] p-2">
                        <IconComponent className="h-5 w-5 text-[#a56131]" />
                      </div>
                      <p className="text-sm font-bold text-[#6f4629]">{label}</p>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>
    </section>

        <section className="mt-12">
          <h2 className="text-3xl font-extrabold text-[#5c3418] md:text-4xl">{t.about.offerTitle}</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {t.about.offerings.map((item, index) => {
              const IconComponent = OFFERING_ICONS[index] || ShieldCheck;
              return (
                <article
                  key={item.title}
                  className="rounded-3xl glass-panel glass-panel-hover p-6"
                >
                  <div className="flex items-start gap-4">
                    <div className="rounded-xl bg-[#f8ebdd] p-2.5">
                      <IconComponent className="h-5 w-5 text-[#a56131]" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-[#5c3418]">{item.title}</h3>
                      <p className="mt-1.5 text-sm text-[#735847] md:text-base">{item.description}</p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="mt-10 rounded-3xl glass-panel p-6 md:p-8">
          <div className="flex flex-wrap items-center gap-4">
            <div className="rounded-full bg-[#f8ebdd] p-3">
              <HandHeart className="h-5 w-5 text-[#a56131]" />
            </div>
            <p className="text-base text-[#735847] md:text-lg leading-relaxed italic">
              "{t.about.footerQuote}"
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
