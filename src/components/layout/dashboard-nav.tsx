import Link from "next/link";

const links = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/children", label: "Child profiles" },
  { href: "/dashboard/products", label: "Products" },
  { href: "/dashboard/campaigns", label: "Donation Calls" },
  { href: "/dashboard/projects", label: "Idea Funding" },
  { href: "/dashboard/updates", label: "Updates" },
];

export function DashboardNav() {
  return (
    <aside className="rounded-xl border border-slate-200 bg-white p-4">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-600">Organization tools</h2>
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
