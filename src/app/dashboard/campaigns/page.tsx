import { requireRole } from "@/lib/auth";
import { getOrganizationContext } from "@/lib/dashboard";
import { createClient } from "@/lib/supabase/server";
import { DashboardNav } from "@/components/layout/dashboard-nav";
import { Card } from "@/components/ui/card";
import { StatusPill } from "@/components/ui/status-pill";
import { ContentForm } from "@/components/forms/content-form";

export default async function CampaignsDashboardPage() {
  const { user } = await requireRole(["organization"]);
  const organization = await getOrganizationContext(user.id);
  const supabase = await createClient();

  const { data: campaigns } = await supabase
    .from("campaigns")
    .select("id, title, summary, amount_needed, amount_raised, status")
    .eq("organization_id", organization?.id ?? "")
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-8">
      <div className="grid gap-6 md:grid-cols-[240px_1fr]">
        <DashboardNav />
        <div className="space-y-5">
          <Card title="Create campaign" description="Campaign requests enter moderation before publication.">
            <ContentForm endpoint="/api/dashboard/campaigns" includeAmount actionLabel="Submit campaign" />
          </Card>
          <Card title="Your campaigns">
            <div className="space-y-3">
              {campaigns?.map((campaign) => (
                <article key={campaign.id} className="rounded-lg border border-slate-200 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold text-slate-900">{campaign.title}</h3>
                    <StatusPill status={campaign.status} />
                  </div>
                  <p className="mt-1 text-sm text-slate-700">{campaign.summary}</p>
                  <p className="mt-1 text-sm text-slate-700">
                    Raised ${Number(campaign.amount_raised ?? 0).toFixed(2)} / $
                    {Number(campaign.amount_needed ?? 0).toFixed(2)}
                  </p>
                </article>
              ))}
              {!campaigns?.length ? <p className="text-sm text-slate-600">No campaign posts yet.</p> : null}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
