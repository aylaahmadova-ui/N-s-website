"use client";

import Link from "next/link";
import { useState } from "react";
import { HandHeart, Menu, X } from "lucide-react";

type HeaderUser = {
  fullName: string | null;
  role: string | null;
};

const menuItems = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Marketplace", href: "/marketplace" },
  { label: "Donation Calls", href: "/campaigns" },
  { label: "Clothing Support", href: "/clothes-donation" },
  { label: "Idea Funding", href: "/projects" },
  { label: "Updates", href: "/updates" },
];

export function SiteHeaderClient({ user }: { user: HeaderUser | null }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const profileLabel = user?.role === "organization" ? "Organization Profile" : "Your Profile";

  return (
    <>
      <aside
        id="global-menu"
        className={`fixed left-0 top-0 z-50 h-full w-[300px] border-r border-[#e3d5c7] bg-[#fcf7f1] p-6 transition-transform duration-300 ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-8 flex items-center justify-between">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#6f4629]">Menu</p>
          <button
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
            className="rounded-full border border-[#e2d2c1] bg-white p-2 text-[#7a4b2a] transition hover:bg-[#fdf7f1]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex flex-col gap-2">
          {menuItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className="rounded-xl px-4 py-3 text-2xl font-semibold text-[#6f4629] transition hover:bg-[#f7ebdd] hover:text-[#a56131]"
            >
              {item.label}
            </Link>
          ))}
          {user ? (
            <Link
              href="/profile"
              onClick={() => setMenuOpen(false)}
              className="rounded-xl px-4 py-3 text-2xl font-semibold text-[#6f4629] transition hover:bg-[#f7ebdd] hover:text-[#a56131]"
            >
              {profileLabel}
            </Link>
          ) : null}
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
              <HandHeart className="h-8 w-8 text-[#a56131]" />
              <span className="text-4xl font-extrabold tracking-tight text-[#7a4b2a]">Kindora</span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Link
                  href="/profile"
                  className="rounded-full border border-[#e3d4c4] bg-white px-4 py-2 text-base font-semibold text-[#7a4b2a] md:px-5 md:text-lg"
                >
                  {profileLabel}
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="rounded-full border border-[#e3d4c4] bg-white px-5 py-2 text-lg font-semibold text-[#7a4b2a] md:px-7 md:py-3 md:text-2xl"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
