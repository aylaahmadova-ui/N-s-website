/* eslint-disable @typescript-eslint/no-explicit-any */
import { requireAdminPageAccess } from "@/lib/admin-access";
import { createAdminClient } from "@/lib/supabase/admin";
import { AdminClient } from "./admin-client";

const DONATION_RECEIPTS_BUCKET = "donation-receipts";

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

  const moderationQueue = [
    ...((campaignsRes.data ?? []).map((item: any) => ({ ...item, table: "campaigns" as const }))),
    ...((projectsRes.data ?? []).map((item: any) => ({ ...item, table: "projects" as const }))),
    ...((updatesRes.data ?? []).map((item: any) => ({ ...item, table: "updates" as const }))),
  ];

  return (
    <AdminClient
      organizations={(organizationsRes.data ?? []) as any}
      moderationQueue={moderationQueue}
      pendingDonations={pendingDonations}
    />
  );
}
