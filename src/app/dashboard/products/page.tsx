import { requireRole } from "@/lib/auth";
import { getOrganizationContext } from "@/lib/dashboard";
import { createClient } from "@/lib/supabase/server";
import { DashboardNav } from "@/components/layout/dashboard-nav";
import { Card } from "@/components/ui/card";
import { StatusPill } from "@/components/ui/status-pill";
import { ContentForm } from "@/components/forms/content-form";

export default async function ProductsDashboardPage() {
  const { user } = await requireRole(["organization"]);
  const organization = await getOrganizationContext(user.id);
  const supabase = await createClient();

  const { data: products } = await supabase
    .from("products")
    .select("id, title, summary, price, status")
    .eq("organization_id", organization?.id ?? "")
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-8">
      <div className="grid gap-6 md:grid-cols-[240px_1fr]">
        <DashboardNav />
        <div className="space-y-5">
          <Card title="Create product post" description="Products are reviewed by admin before publication.">
            <ContentForm endpoint="/api/dashboard/products" includePrice actionLabel="Submit product" />
          </Card>
          <Card title="Your products">
            <div className="space-y-3">
              {products?.map((product) => (
                <article key={product.id} className="rounded-lg border border-slate-200 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold text-slate-900">{product.title}</h3>
                    <StatusPill status={product.status} />
                  </div>
                  <p className="mt-1 text-sm text-slate-700">{product.summary}</p>
                  <p className="mt-1 text-sm text-amber-900">${Number(product.price ?? 0).toFixed(2)}</p>
                </article>
              ))}
              {!products?.length ? <p className="text-sm text-slate-600">No product posts yet.</p> : null}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
