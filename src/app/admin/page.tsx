/* eslint-disable @typescript-eslint/no-explicit-any */
import { requireAdminPageAccess } from "@/lib/admin-access";
import { createAdminClient } from "@/lib/supabase/admin";
import { AdminClient } from "./admin-client";
import { safeExternalUrl } from "@/lib/utils";

const DONATION_RECEIPTS_BUCKET = "donation-receipts";

export default async function AdminPage() {
  await requireAdminPageAccess();
  const supabase = createAdminClient();

  const [organizationsRes, campaignsRes, projectsRes, updatesRes, donationsRes, orgLogsRes] = await Promise.all([
    supabase
      .from("organizations")
      .select(
        "id, legal_name, display_name, description, website, contact_email, status, created_at, updated_at, applicant:created_by(full_name)",
      )
      .order("created_at", { ascending: false }),
    supabase.from("campaigns").select("id, title, status").eq("status", "pending").order("created_at", { ascending: false }),
    supabase.from("projects").select("id, title, status").eq("status", "pending").order("created_at", { ascending: false }),
    supabase.from("updates").select("id, title, status").eq("status", "pending").order("created_at", { ascending: false }),
    supabase
      .from("campaign_donations")
      .select("id, donor_name, is_anonymous, amount, receipt_path, status, created_at, campaigns(title)")
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("moderation_logs")
      .select("id, target_id, action, notes, created_at")
      .eq("target_type", "organization")
      .order("created_at", { ascending: false })
      .limit(200),
  ]);

  // Group decision history per organization so each card can render its own trail.
  const historyByOrg = new Map<string, { id: string; action: string; notes: string | null; createdAt: string }[]>();
  for (const log of (orgLogsRes.data ?? []) as any[]) {
    const bucket = historyByOrg.get(log.target_id) ?? [];
    bucket.push({
      id: log.id as string,
      action: log.action as string,
      notes: (log.notes as string | null) ?? null,
      createdAt: log.created_at as string,
    });
    historyByOrg.set(log.target_id, bucket);
  }

  const organizations = ((organizationsRes.data ?? []) as any[]).map((org) => {
    const applicant = Array.isArray(org.applicant) ? org.applicant[0] : org.applicant;
    return {
      id: org.id as string,
      legalName: org.legal_name as string,
      displayName: org.display_name as string,
      description: org.description as string,
      website: safeExternalUrl(org.website as string | null),
      contactEmail: org.contact_email as string,
      status: org.status as "pending" | "approved" | "rejected" | "published" | "draft",
      applicantName: (applicant?.full_name as string | null) ?? null,
      createdAt: org.created_at as string,
      updatedAt: org.updated_at as string,
      history: historyByOrg.get(org.id as string) ?? [],
    };
  });

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
      organizations={organizations}
      moderationQueue={moderationQueue}
      pendingDonations={pendingDonations}
    />
  );
}
