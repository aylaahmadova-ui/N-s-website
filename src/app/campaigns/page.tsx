import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";

export default async function CampaignsPage() {
  const supabase = await createClient();
  const { data: campaigns } = await supabase
    .from("campaigns")
    .select("id, title, summary, amount_needed, amount_raised, organizations(display_name)")
    .eq("status", "published")
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-8">
      <h1 className="text-3xl font-semibold text-amber-900">Donation Campaigns</h1>
      <p className="mt-2 text-slate-600">Verified campaigns for immediate and real needs.</p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
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
        {!campaigns?.length ? <p className="text-slate-600">No active campaigns yet.</p> : null}
      </div>
    </div>
  );
}
