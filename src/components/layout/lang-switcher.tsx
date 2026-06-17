"use client";

import { useLanguage } from "@/lib/i18n/context";
import type { Lang } from "@/lib/i18n/translations";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

const LANGS: { code: Lang; flag: string; label: string }[] = [
  { code: "az", flag: "🇦🇿", label: "AZ" },
  { code: "en", flag: "🇪🇳", label: "EN" },
  { code: "ru", flag: "🇷🇺", label: "RU" },
];

export function LangSwitcher() {
  const { lang, setLang } = useLanguage();
  const [open, setOpen] = useState(false);
  const current = LANGS.find((l) => l.code === lang) ?? LANGS[0];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-full border border-[#e2d2c1] bg-white px-3 py-2 text-sm font-bold text-[#7a4b2a] transition hover:bg-[#fdf7f1]"
        aria-label="Select language"
      >
        <span>{current.flag}</span>
        <span>{current.label}</span>
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <>
          <button
            className="fixed inset-0 z-40"
            aria-label="Close language menu"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-full z-50 mt-2 w-32 overflow-hidden rounded-xl border border-[#e3d5c7] bg-white shadow-lg">
            {LANGS.map((l) => (
              <button
                key={l.code}
                type="button"
                onClick={() => {
                  setLang(l.code);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-2 px-4 py-2.5 text-sm font-semibold transition hover:bg-[#fdf7f1] ${
                  lang === l.code ? "bg-[#fdf3e8] text-[#a56131]" : "text-[#5c3418]"
                }`}
              >
                <span>{l.flag}</span>
                <span>{l.label}</span>
                {lang === l.code && <span className="ml-auto text-xs text-[#a56131]">✓</span>}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
