"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  HandHeart,
  ArrowRight,
  Info,
  HeartHandshake,
  Shirt,
  TrendingUp,
  Award,
  Sparkles,
  ShieldCheck,
  X,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";

const FEATURE_ICONS = [Info, HeartHandshake, Shirt, TrendingUp, Award];
const FEATURE_HREFS = ["/about", "/campaigns", "/clothes-donation", "/updates", "/recognition"];
const FEATURE_COLORS = [
  "from-amber-500/10 to-orange-500/10",
  "from-rose-500/10 to-orange-500/10",
  "from-blue-500/10 to-teal-500/10",
  "from-green-500/10 to-emerald-500/10",
  "from-purple-500/10 to-indigo-500/10",
];
const FEATURE_ICON_COLORS = [
  "text-amber-800",
  "text-rose-800",
  "text-blue-800",
  "text-emerald-800",
  "text-amber-700",
];

export default function HomePage() {
  const { t } = useLanguage();
  const { hero, features, quote, contact } = t;

  const headingWords = (hero.title || "Start with Destekly").split(" ");
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmitContact = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
    }, 1200);
  };

  function openSidebarMenu() {
    window.dispatchEvent(new Event("destekly:open-menu"));
  }

  return (
    <div className="min-h-screen bg-[#f6f1ea] text-[#3f2c1d]">
      {/* Hero Section */}
      <section className="relative flex min-h-[90vh] w-full items-center justify-center overflow-hidden px-6 py-20 lg:px-10">
        <div className="absolute inset-0 z-0">
          <Image
            src="/hero_background.png"
            alt="Artistic background representing NGO child support and collaboration"
            fill
            className="object-cover opacity-[0.22]"
            priority
          />
          <div className="pointer-events-none absolute inset-0 bg-radial-gradient from-transparent via-[#f6f1ea]/40 to-[#f6f1ea]" />
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#f6f1ea] to-transparent" />
        </div>

        <div className="relative z-10 w-full max-w-4xl px-4 py-8 text-center">
          <div className="mb-6 flex justify-center">
            <Image
              src="/logo3.png"
              alt="Destekly logo"
              width={96}
              height={96}
              className="h-24 w-24 object-contain transition-transform hover:scale-105"
              priority
            />
          </div>

          <p className="inline-flex items-center gap-2 rounded-full border border-[#e0cfbc] bg-[#f7ebdf] px-6 py-2 text-xs font-bold tracking-[0.14em] text-[#9c5f30]">
            <Sparkles className="h-4 w-4" />
            {hero.badge}
          </p>

          <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-5xl md:text-7xl">
            <span className="heading-glint">
              {headingWords.map((word, wordIndex) => {
                const charsBefore = headingWords.slice(0, wordIndex).join("").length + wordIndex;
                return (
                  <span key={word} className="heading-glint-word">
                    {word.split("").map((char, charIndex) => {
                      const index = charsBefore + charIndex;
                      const isAccent = word.toLowerCase().includes("destekly");
                      return (
                        <span
                          key={`${word}-${char}-${charIndex}`}
                          className={`heading-glint-letter ${isAccent ? "heading-glint-letter-accent" : "heading-glint-letter-base"}`}
                          style={{ animationDelay: `${index * 0.09}s` }}
                        >
                          {char}
                        </span>
                      );
                    })}
                    {wordIndex < headingWords.length - 1 ? <span className="heading-glint-space">&nbsp;</span> : null}
                  </span>
                );
              })}
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-[#735847] md:text-xl">
            {hero.subtitle}
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => setIsContactOpen(true)}
              className="cursor-pointer rounded-full bg-[#a56131] px-10 py-3.5 text-base font-bold text-white shadow-[0_10px_25px_rgba(165,97,49,0.25)] transition hover:bg-[#8e4f25] hover:shadow-[0_14px_30px_rgba(165,97,49,0.35)]"
            >
              {hero.contactUs}
            </button>
            <button
              type="button"
              onClick={openSidebarMenu}
              className="cursor-pointer rounded-full border border-[#e3d5c7] bg-white px-10 py-3.5 text-base font-bold text-[#623a1f] transition hover:border-[#a56131]/30 hover:bg-[#fdf7f1]"
            >
              {hero.browseFeatures}
            </button>
          </div>

          <div className="mt-10 flex items-center justify-center gap-2.5 text-[#6f4629]">
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
            <p className="text-sm font-semibold tracking-wide">{hero.safeTagline}</p>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
        <div className="mb-14 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-[#5c3418] md:text-4xl">
            {features.sectionTitle}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-base text-[#735847]">
            {features.sectionSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Double-column About card */}
          <div className="glass-panel glass-panel-hover group relative flex flex-col justify-between rounded-3xl p-8 md:col-span-2">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-800">
                  <Info className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
                    {features.items[0].subtitle}
                  </span>
                  <h3 className="mt-0.5 text-2xl font-bold text-[#5c3418]">
                    {features.items[0].title}
                  </h3>
                </div>
              </div>
              <p className="mt-6 max-w-2xl text-base leading-relaxed text-[#735847]">
                {features.items[0].description}
              </p>

              <div className="mt-6 grid grid-cols-2 gap-4 border-t border-[#e3d5c7]/50 pt-6">
                <div className="flex items-start gap-2.5">
                  <ShieldCheck className="mt-0.5 h-5 w-5 text-emerald-600" />
                  <div>
                    <h4 className="text-sm font-bold text-[#5c3418]">{features.verifiedHomes}</h4>
                    <p className="text-xs text-[#735847]">{features.verifiedHomesDesc}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <HandHeart className="mt-0.5 h-5 w-5 text-[#a56131]" />
                  <div>
                    <h4 className="text-sm font-bold text-[#5c3418]">{features.supervisedSafety}</h4>
                    <p className="text-xs text-[#735847]">{features.supervisedSafetyDesc}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <Link href="/about" className="inline-flex items-center gap-2 text-sm font-bold text-[#a56131] group-hover:text-[#8e4f25]">
                {features.items[0].actionText}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1.5" />
              </Link>
            </div>
          </div>

          {/* Dynamic module cards */}
          {features.items.slice(1).map((feat, i) => {
            const IconComponent = FEATURE_ICONS[i + 1];
            return (
              <div key={feat.title} className="glass-panel glass-panel-hover group flex flex-col justify-between rounded-3xl p-8">
                <div>
                  <div className="flex items-center gap-3">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${FEATURE_COLORS[i + 1]} ${FEATURE_ICON_COLORS[i + 1]}`}>
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-[#9c5f30]">
                        {feat.subtitle}
                      </span>
                      <h3 className="text-xl font-bold text-[#5c3418]">{feat.title}</h3>
                    </div>
                  </div>
                  <p className="mt-5 text-sm leading-relaxed text-[#735847]">{feat.description}</p>
                </div>

                <div className="mt-8">
                  <Link href={FEATURE_HREFS[i + 1]} className="inline-flex items-center gap-2 text-sm font-bold text-[#a56131] group-hover:text-[#8e4f25]">
                    {feat.actionText}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Quote */}
      <section className="mx-auto max-w-4xl border-t border-[#e3d5c7]/40 px-6 py-16 text-center">
        <blockquote className="text-xl font-medium italic leading-relaxed text-[#6f4629] md:text-2xl">
          {quote.text}
        </blockquote>
        <cite className="mt-4 block text-sm font-bold uppercase tracking-wider text-[#9c5f30]">
          {quote.author}
        </cite>
      </section>

      {/* Contact Modal */}
      {isContactOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass-panel relative w-full max-w-lg rounded-3xl p-6 shadow-2xl md:p-8 animate-in zoom-in-95 duration-200">
            <button
              type="button"
              onClick={() => { setIsContactOpen(false); setIsSuccess(false); }}
              className="absolute right-4 top-4 cursor-pointer rounded-full border border-[#e2d2c1] bg-white p-2 text-[#7a4b2a] transition hover:bg-[#fdf7f1]"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>

            {isSuccess ? (
              <div className="py-6 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-800">
                  <ShieldCheck className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-bold text-[#5c3418]">{contact.successTitle}</h3>
                <p className="mt-3 text-base text-[#735847]">{contact.successDesc}</p>
                <button
                  type="button"
                  onClick={() => { setIsContactOpen(false); setIsSuccess(false); }}
                  className="mt-6 cursor-pointer rounded-full bg-[#a56131] px-8 py-2.5 text-sm font-bold text-white transition hover:bg-[#8e4f25]"
                >
                  {contact.close}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitContact} className="space-y-4">
                <div>
                  <h3 className="text-2xl font-bold text-[#5c3418]">{contact.title}</h3>
                  <p className="mt-1 text-sm text-[#735847]">{contact.subtitle}</p>
                </div>

                <div className="space-y-1">
                  <label htmlFor="contact-name" className="text-xs font-bold uppercase tracking-wider text-[#6f4629]">{contact.nameLabel}</label>
                  <input
                    type="text" id="contact-name" required value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-xl border border-[#e3d5c7] bg-white px-4 py-2.5 text-[#3f2c1d] outline-none transition focus:border-[#a56131]"
                    placeholder={contact.namePlaceholder}
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="contact-email" className="text-xs font-bold uppercase tracking-wider text-[#6f4629]">{contact.emailLabel}</label>
                  <input
                    type="email" id="contact-email" required value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full rounded-xl border border-[#e3d5c7] bg-white px-4 py-2.5 text-[#3f2c1d] outline-none transition focus:border-[#a56131]"
                    placeholder={contact.emailPlaceholder}
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="contact-subject" className="text-xs font-bold uppercase tracking-wider text-[#6f4629]">{contact.subjectLabel}</label>
                  <input
                    type="text" id="contact-subject" required value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full rounded-xl border border-[#e3d5c7] bg-white px-4 py-2.5 text-[#3f2c1d] outline-none transition focus:border-[#a56131]"
                    placeholder={contact.subjectPlaceholder}
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="contact-message" className="text-xs font-bold uppercase tracking-wider text-[#6f4629]">{contact.messageLabel}</label>
                  <textarea
                    id="contact-message" required rows={4} value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full resize-none rounded-xl border border-[#e3d5c7] bg-white px-4 py-2.5 text-[#3f2c1d] outline-none transition focus:border-[#a56131]"
                    placeholder={contact.messagePlaceholder}
                  />
                </div>

                <button
                  type="submit" disabled={isSubmitting}
                  className="w-full cursor-pointer rounded-full bg-[#a56131] py-3 text-base font-bold text-white shadow-md transition hover:bg-[#8e4f25] disabled:opacity-55"
                >
                  {isSubmitting ? contact.sending : contact.send}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
