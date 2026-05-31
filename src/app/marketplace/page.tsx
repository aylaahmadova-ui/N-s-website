import { Plus, Sparkles, Store } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { isAdminUnlocked } from "@/lib/admin-access";
import { ProductQuickForm } from "@/components/forms/product-quick-form";
import { ProductCard } from "@/components/marketplace/product-card";

export default async function MarketplacePage() {
  const supabase = await createClient();
  const adminUnlocked = await isAdminUnlocked();

  const { data: products } = await supabase
    .from("products")
    .select("id, title, summary, price, image_url")
    .eq("status", "published")
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-8">
      <section className="mb-8 rounded-3xl border border-[#e3d5c7] bg-gradient-to-br from-[#fff8f1] via-[#fff4e9] to-[#fef9f5] p-6 shadow-sm md:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-[#e6d5c3] bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#8a5832]">
              <Sparkles className="h-3.5 w-3.5" />
              Destekly Marketplace
            </p>
            <h1 className="mt-4 text-3xl font-semibold text-amber-900 md:text-4xl">Handmade Products</h1>
            <p className="mt-2 max-w-2xl text-base text-[#6d5b4b] md:text-lg">
              Shop meaningful creations made with care.
            </p>
          </div>
          <Store className="mt-1 hidden h-8 w-8 text-[#b97843] md:block" />
        </div>
      </section>

      {adminUnlocked ? (
        <section className="mb-8">
          <ProductQuickForm />
        </section>
      ) : null}

      <div className="flex flex-wrap items-start gap-4">
        {adminUnlocked ? (
          <div className="flex h-[23.5rem] w-full min-w-0 max-w-none flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#dcbda2] bg-white text-[#8b4e22] md:w-[16.5rem] md:max-w-[16.5rem] md:min-w-[16.5rem]">
            <Plus className="h-10 w-10" />
            <span className="mt-2 text-sm font-semibold">Use form above to post</span>
          </div>
        ) : null}

        {products?.map((product: any) => (
          <ProductCard
            key={product.id}
            id={product.id}
            title={product.title}
            summary={product.summary}
            price={Number(product.price ?? 0)}
            imageUrl={product.image_url}
            adminUnlocked={adminUnlocked}
          />
        ))}
      </div>

      {!products?.length ? (
        <div className="mt-6 rounded-2xl border border-dashed border-[#decab7] bg-[#fffaf6] px-4 py-10 text-center text-[#7b6857]">
          No products published yet.
        </div>
      ) : null}
    </div>
  );
}
