/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { LangSwitcher } from "@/components/layout/lang-switcher";
import { useLanguage } from "@/lib/i18n/context";

export function SiteHeaderClient() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { t } = useLanguage();

  const menuItems = [
    { label: t.nav.home, href: "/" },
    { label: t.nav.about, href: "/about" },
    { label: t.nav.donationCalls, href: "/campaigns" },
    { label: t.nav.recognition, href: "/recognition" },
    { label: t.nav.clothingSupport, href: "/clothes-donation" },
    { label: t.nav.updates, href: "/updates" },
  ];

  useEffect(() => {
    function handleOpenMenu() {
      setMenuOpen(true);
    }
    window.addEventListener("destekly:open-menu", handleOpenMenu);
    return () => window.removeEventListener("destekly:open-menu", handleOpenMenu);
  }, []);

  return (
    <>
      <aside
        id="global-menu"
        className={`fixed left-0 top-0 z-50 h-full w-[300px] border-r border-[#e3d5c7] bg-[#fcf7f1] p-6 transition-transform duration-300 ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-8 flex items-center justify-between">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#6f4629]">{t.nav.menu}</p>
          <button
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
            className="rounded-full border border-[#e2d2c1] bg-white p-2 text-[#7a4b2a] transition hover:bg-[#fdf7f1]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex flex-col gap-2">
          {menuItems.map((item: any) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className="rounded-xl px-4 py-3 text-2xl font-semibold text-[#6f4629] transition hover:bg-[#f7ebdd] hover:text-[#a56131]"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/admin"
            onClick={() => setMenuOpen(false)}
            className="rounded-xl px-4 py-3 text-2xl font-semibold text-[#6f4629] transition hover:bg-[#f7ebdd] hover:text-[#a56131]"
          >
            {t.nav.admin}
          </Link>
        </nav>
      </aside>

      {menuOpen ? (
        <button
          aria-label="Close menu overlay"
          onClick={() => setMenuOpen(false)}
          className="fixed inset-0 z-40 bg-black/25"
        />
      ) : null}

      <header className="sticky top-0 z-30 border-b border-[#e3d5c7] bg-[#fcf7f1]/95 backdrop-blur">
        <div className="mx-auto flex h-24 w-full max-w-7xl items-center justify-between px-6 lg:px-10">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-controls="global-menu"
              aria-label="Open menu"
              className="rounded-full border border-[#e2d2c1] bg-white p-3 text-[#7a4b2a] transition hover:bg-[#fdf7f1]"
            >
              <Menu className="h-6 w-6" />
            </button>
            <Link href="/" className="flex items-center gap-2">
              <Image src="/logo3.png" alt="Destekly logo" width={46} height={46} className="h-11 w-11 object-contain" priority />
              <span className="text-4xl font-extrabold tracking-tight text-[#7a4b2a]">Destekly</span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <LangSwitcher />
          </div>
        </div>
      </header>
    </>
  );
}
