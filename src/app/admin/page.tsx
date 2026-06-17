/* eslint-disable @typescript-eslint/no-explicit-any */
import { requireAdminPageAccess } from "@/lib/admin-access";
import { createAdminClient } from "@/lib/supabase/admin";
import { Card } from "@/components/ui/card";
import { StatusPill } from "@/components/ui/status-pill";
import { OrganizationReviewActions } from "@/components/admin/organization-review-actions";
import { ModerationActions } from "@/components/admin/moderation-actions";
import { DonationReviewActions } from "@/components/admin/donation-review-actions";

const DONATION_RECEIPTS_BUCKET = "donation-receipts";

type ModerationItem = {
  table: "campaigns" | "projects" | "updates";
  id: string;
  title: string;
  status: "pending" | "approved" | "rejected" | "published" | "draft";
};

export default async function AdminPage() {
  await requireAdminPageAccess();
  const supabase = createAdminClient();

  const [organizationsRes, campaignsRes, projectsRes, updatesRes, donationsRes] = await Promise.all([
    supabase.from("organizations").select("id, display_name, description, status").order("created_at", { ascending: false }),
    supabase.from("campaigns").select("id, title, status").eq("status", "pending").order("created_at", { ascending: false }),
    supabase.from("projects").select("id, title, status").eq("status", "pending").order("created_at", { ascending: false }),
    supabase.from("updates").select("id, title, status").eq("status", "pending").order("created_at", { ascending: false }),
    supabase
      .from("campaign_donations")
      .select("id, donor_name, is_anonymous, amount, receipt_path, status, created_at, campaigns(title)")
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  // Generate signed URLs for pending donation receipts
  const pendingDonations = await Promise.all(
    (donationsRes.data ?? []).map(async (d: any) => {
      let receiptUrl: string | null = null;
      if (d.receipt_path) {
        const { data: signed } = await supabase.storage
          .from(DONATION_RECEIPTS_BUCKET)
          .createSignedUrl(d.receipt_path, 60 * 60);
        receiptUrl = signed?.signedUrl ?? null;
      }
      const campaign = Array.isArray(d.campaigns) ? d.campaigns[0] : d.campaigns;
      return {
        id: d.id as string,
        donorName: d.is_anonymous ? "Anonymous" : (d.donor_name as string),
        amount: Number(d.amount ?? 0),
        campaignTitle: (campaign?.title as string) ?? "—",
        receiptUrl,
        createdAt: d.created_at as string,
      };
    }),
  );

  const moderationQueue: ModerationItem[] = [
    ...((campaignsRes.data ?? []).map((item: any) => ({ ...item, table: "campaigns" as const }))),
    ...((projectsRes.data ?? []).map((item: any) => ({ ...item, table: "projects" as const }))),
    ...((updatesRes.data ?? []).map((item: any) => ({ ...item, table: "updates" as const }))),
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-8">
      <h1 className="text-3xl font-semibold text-amber-900">Admin Dashboard</h1>
      <p className="mt-2 text-slate-600">Approve organizations, moderate content, and review donations.</p>

      {/* Donation review queue */}
      <section className="mt-8">
        <Card
          title={`Donation receipts (${pendingDonations.length} pending)`}
          description="Review the physical invoice/receipt against your bank statement, then approve or reject."
        >
          <div className="space-y-3">
            {pendingDonations.map((d) => (
              <article key={d.id} className="rounded-lg border border-slate-200 p-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-slate-900">{d.donorName}</p>
                    <p className="text-xs text-slate-500">{d.campaignTitle}</p>
                    <p className="mt-0.5 text-sm font-bold text-amber-900">AZN {d.amount.toFixed(2)}</p>
                    <p className="text-xs text-slate-400">{new Date(d.createdAt).toLocaleString()}</p>
                  </div>
                  <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">pending</span>
                </div>
                <div className="mt-3">
                  <DonationReviewActions donationId={d.id} receiptUrl={d.receiptUrl} />
                </div>
              </article>
            ))}
            {!pendingDonations.length ? (
              <p className="text-sm text-slate-600">No pending donation receipts.</p>
            ) : null}
          </div>
        </Card>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-2">
        <Card title="Organization approvals" description="Review pending applications before publication rights are granted.">
          <div className="space-y-3">
            {organizationsRes.data?.map((org: any) => (
              <article key={org.id} className="rounded-lg border border-slate-200 p-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{org.display_name}</h3>
                  <StatusPill status={org.status} />
                </div>
                <p className="mt-1 text-sm text-slate-700">{org.description}</p>
                {org.status === "pending" ? (
                  <div className="mt-3">
                    <OrganizationReviewActions organizationId={org.id} />
                  </div>
                ) : null}
              </article>
            ))}
            {!organizationsRes.data?.length ? <p className="text-sm text-slate-600">No organizations found.</p> : null}
          </div>
        </Card>

        <Card title="Moderation queue" description="Content waiting for publish review.">
          <div className="space-y-3">
            {moderationQueue.map((item: any) => (
              <article key={item.id} className="rounded-lg border border-slate-200 p-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="font-medium text-slate-900">{item.title}</p>
                    <p className="mt-1 text-xs uppercase tracking-wide text-slate-500">{item.table.slice(0, -1)}</p>
                  </div>
                  <StatusPill status={item.status} />
                </div>
                <div className="mt-3">
                  <ModerationActions table={item.table} itemId={item.id} />
                </div>
              </article>
            ))}
            {!moderationQueue.length ? <p className="text-sm text-slate-600">No pending content in queue.</p> : null}
          </div>
        </Card>
      </section>
    </div>
  );
}
