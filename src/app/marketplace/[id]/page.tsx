import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, PackageOpen } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";

type Params = { params: Promise<{ id: string }> };

export default async function MarketplaceDetailsPage({ params }: Params) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select("id, title, summary, price, image_url, organizations(display_name, contact_email)")
    .eq("id", id)
    .eq("status", "published")
    .maybeSingle();

  if (!product) notFound();

  const orgName =
    (Array.isArray(product.organizations)
      ? product.organizations[0]?.display_name
      : (product.organizations as { display_name?: string } | null)?.display_name) ?? "Organization";
  const orgEmail =
    (Array.isArray(product.organizations)
      ? product.organizations[0]?.contact_email
      : (product.organizations as { contact_email?: string } | null)?.contact_email) ?? null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 md:px-8">
      <Link href="/marketplace" className="inline-flex items-center gap-2 text-sm font-medium text-[#8b4e22] hover:underline">
        <ArrowLeft className="h-4 w-4" />
        Back to Marketplace
      </Link>

      <Card className="mt-5 overflow-hidden rounded-2xl border-[#eadccf] p-0">
        <div className="h-64 bg-[#f4e8dc] md:h-80">
          {product.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.image_url} alt={product.title} className="h-full w-full bg-white p-4 object-contain" />
          ) : (
            <div className="flex h-full items-center justify-center text-[#9b6f4b]">
              <PackageOpen className="h-8 w-8" />
            </div>
          )}
        </div>
        <div className="p-6">
          <h1 className="text-3xl font-bold tracking-tight text-[#61341c]">{product.title}</h1>
          <p className="mt-2 text-[#786455]">By {orgName}</p>
          <p className="mt-5 whitespace-pre-line text-base leading-7 text-[#5f4d40]">{product.summary}</p>

          <div className="mt-6 flex items-start justify-between gap-3">
            <p className="text-2xl font-semibold text-[#8b4e22]">${Number(product.price ?? 0).toFixed(2)}</p>
            <details className="group w-[240px] shrink-0 text-right">
              <summary className="list-none cursor-pointer rounded-lg bg-[#a95d2b] px-4 py-2 text-center text-sm font-semibold text-white transition hover:bg-[#954e21]">
                Contact Organization
              </summary>
              <div className="mt-2 w-full rounded-md border border-[#e3d5c7] bg-[#fffaf5] px-3 py-2 text-sm text-[#6f513d]">
                {orgEmail ? (
                  <a href={`mailto:${orgEmail}`} className="break-all font-medium text-[#8b4e22] underline">
                    {orgEmail}
                  </a>
                ) : (
                  <span>Email not available</span>
                )}
              </div>
            </details>
          </div>
        </div>
      </Card>
    </div>
  );
}
