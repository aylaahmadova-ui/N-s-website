import Link from "next/link";
import { PackageOpen, Sparkles, Store } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { getOrganizationContext } from "@/lib/dashboard";
import { Card } from "@/components/ui/card";
import { ProductQuickForm } from "@/components/forms/product-quick-form";

export default async function MarketplacePage() {
  const supabase = await createClient();
  const currentUser = await getCurrentUser();

  const { data: products } = await supabase
    .from("products")
    .select("id, title, summary, price, image_url, organizations(display_name)")
    .eq("status", "published")
    .order("created_at", { ascending: false });

  const isOrg = currentUser?.profile?.role === "organization";
  const isAdmin = currentUser?.profile?.role === "admin";
  const organizationUserId = currentUser?.user.id ?? null;
  const organization = (isOrg || isAdmin) && organizationUserId ? await getOrganizationContext(organizationUserId) : null;
  const postingEnabled = Boolean(organization) && (isOrg || isAdmin);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-8">
      <section className="mb-8 rounded-3xl border border-[#e3d5c7] bg-gradient-to-br from-[#fff8f1] via-[#fff4e9] to-[#fef9f5] p-6 shadow-sm md:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-[#e6d5c3] bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#8a5832]">
              <Sparkles className="h-3.5 w-3.5" />
              Kindora Marketplace
            </p>
            <h1 className="mt-4 text-3xl font-semibold text-amber-900 md:text-4xl">Handmade Products</h1>
            <p className="mt-2 max-w-2xl text-base text-[#6d5b4b] md:text-lg">
              Shop meaningful creations made with care. If you are a verified organization, you can submit products with prices and details right here.
            </p>
          </div>
          <Store className="mt-1 hidden h-8 w-8 text-[#b97843] md:block" />
        </div>
      </section>

      {postingEnabled ? (
        <section className="mb-8">
          <ProductQuickForm />
        </section>
      ) : null}

      {!postingEnabled && currentUser ? (
        <div className="mb-8 rounded-2xl border border-[#e3d5c7] bg-[#fff8f0] p-4 text-sm text-[#705a49]">
          You are signed in as <span className="font-semibold">{currentUser.profile?.role ?? "supporter"}</span>. Only organization accounts can submit products.
        </div>
      ) : null}

      {(isOrg || isAdmin) && !organization ? (
        <div className="mb-8 rounded-2xl border border-[#e3d5c7] bg-[#fff8f0] p-4 text-sm text-[#705a49]">
          Your organization membership is not linked yet. Complete verification first from{" "}
          <Link href="/apply" className="font-semibold text-[#8b4e22] underline">
            Organization verification
          </Link>
          .
        </div>
      ) : null}

      <div className="flex flex-wrap items-start gap-2">
        {products?.map((product) => (
          <Card
            key={product.id}
            className="flex h-[33rem] w-[18rem] max-w-[18rem] min-w-[18rem] flex-col overflow-hidden rounded-2xl border-[#eadccf] p-0"
          >
            <div className="h-64 bg-[#f4e8dc]">
              {product.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={product.image_url} alt={product.title} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-[#9b6f4b]">
                  <PackageOpen className="h-7 w-7" />
                </div>
              )}
            </div>
            <div className="flex flex-1 flex-col p-3 pb-2">
              <h2 className="min-h-[3.2rem] text-base font-semibold leading-tight text-[#61341c]">{product.title}</h2>
              <p className="mt-0.5 min-h-[1.5rem] text-sm text-[#786455]">
                By{" "}
                {(Array.isArray(product.organizations)
                  ? product.organizations[0]?.display_name
                  : (product.organizations as { display_name?: string } | null)?.display_name) ?? "Organization"}
              </p>
              <p className="mt-0.5 min-h-[2.5rem] text-xs text-[#7f6b5b]">Press details to read the full description.</p>
              <div className="mt-auto flex items-center justify-between gap-3 pt-2">
                <p className="text-base font-semibold text-[#8b4e22]">${Number(product.price ?? 0).toFixed(2)}</p>
                <Link href={`/marketplace/${product.id}`} className="rounded-lg bg-[#a95d2b] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#954e21]">
                  Details
                </Link>
              </div>
            </div>
          </Card>
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
