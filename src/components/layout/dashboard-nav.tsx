"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/i18n/context";

export function DashboardNav() {
  const { t } = useLanguage();

  const links = [
    { href: "/dashboard", label: t.dashboard.nav.overview },
    { href: "/dashboard/children", label: t.dashboard.nav.childProfiles },
    { href: "/dashboard/campaigns", label: t.dashboard.nav.donationCalls },
    { href: "/dashboard/projects", label: t.dashboard.nav.ideaFunding },
    { href: "/dashboard/recognition", label: t.dashboard.nav.recognition },
    { href: "/dashboard/updates", label: t.dashboard.nav.updates },
  ];

  return (
    <aside className="rounded-xl border border-slate-200 bg-white p-4">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-600">{t.dashboard.nav.orgTools}</h2>
      <nav className="mt-3 flex flex-col gap-2 text-sm">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className="rounded-md px-2 py-1.5 text-slate-700 hover:bg-amber-50 hover:text-amber-900">
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
