import { Shirt, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { getOrganizationContext } from "@/lib/dashboard";
import { Card } from "@/components/ui/card";
import { CampaignQuickForm } from "@/components/forms/campaign-quick-form";

export default async function ClothesDonationPage() {
  const supabase = await createClient();
  const currentUser = await getCurrentUser();

  const { data: campaigns } = await supabase
    .from("campaigns")
    .select("id, title, summary, amount_needed, amount_raised, organizations(display_name)")
    .eq("status", "published")
    .or("title.ilike.%clothes%,summary.ilike.%clothes%,title.ilike.%clothing%,summary.ilike.%clothing%")
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
              Clothing Support
            </p>
            <h1 className="mt-4 text-3xl font-semibold text-amber-900 md:text-4xl">Clothing Support</h1>
            <p className="mt-2 max-w-2xl text-base text-[#6d5b4b] md:text-lg">
              Support children with clean, seasonal clothing through verified organizations. Post needs, review requests,
              and contribute with dignity.
            </p>
          </div>
          <Shirt className="mt-1 hidden h-8 w-8 text-[#b97843] md:block" />
        </div>
      </section>

      {postingEnabled ? (
        <section className="mt-6 mb-8">
          <Card
            className="rounded-3xl border-[#e3d5c7] bg-white/95 p-6"
            title="Post a clothing support request"
            description="Create a campaign for clothing needs. Include season, age range, and urgency in your description."
          >
            <CampaignQuickForm />
          </Card>
        </section>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        {campaigns?.map((campaign) => (
          <Card key={campaign.id} title={campaign.title} description={campaign.summary}>
            <p className="text-sm text-slate-600">
              By{" "}
              {(Array.isArray(campaign.organizations)
                ? campaign.organizations[0]?.display_name
                : (campaign.organizations as { display_name?: string } | null)?.display_name) ?? "Organization"}
            </p>
            <p className="mt-2 text-sm text-slate-700">
              Raised ${Number(campaign.amount_raised ?? 0).toFixed(2)} / ${Number(campaign.amount_needed ?? 0).toFixed(2)}
            </p>
            <button className="mt-3 rounded-md bg-amber-700 px-3 py-2 text-sm text-white">Donate via Stripe (placeholder)</button>
          </Card>
        ))}
      </div>

      {!campaigns?.length ? (
        <div className="mt-6 rounded-2xl border border-dashed border-[#decab7] bg-[#fffaf6] px-4 py-6 text-center text-[#7b6857]">
          No clothing support calls yet.
        </div>
      ) : null}
    </div>
  );
}
