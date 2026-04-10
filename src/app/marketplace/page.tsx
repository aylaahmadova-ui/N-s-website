import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";

export default async function MarketplacePage() {
  const supabase = await createClient();
  const { data: products } = await supabase
    .from("products")
    .select("id, title, summary, price, organizations(display_name)")
    .eq("status", "published")
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-8">
      <h1 className="text-3xl font-semibold text-amber-900">Marketplace</h1>
      <p className="mt-2 text-slate-600">Handmade products posted by approved organizations.</p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {products?.map((product) => (
          <Card key={product.id} title={product.title} description={product.summary}>
            <p className="text-sm text-slate-600">
              By{" "}
              {(Array.isArray(product.organizations)
                ? product.organizations[0]?.display_name
                : (product.organizations as { display_name?: string } | null)?.display_name) ?? "Organization"}
            </p>
            <p className="mt-2 text-lg font-semibold text-amber-900">${Number(product.price ?? 0).toFixed(2)}</p>
            <button className="mt-3 rounded-md bg-amber-700 px-3 py-2 text-sm text-white">Stripe Checkout (placeholder)</button>
          </Card>
        ))}
        {!products?.length ? <p className="text-slate-600">No products published yet.</p> : null}
      </div>
    </div>
  );
}
