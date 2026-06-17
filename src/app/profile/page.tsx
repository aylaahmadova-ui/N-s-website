/* eslint-disable @typescript-eslint/no-explicit-any */
import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import ProfileClient from "./profile-client";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const { user, profile } = await requireAuth();
  const supabase = await createClient();

  // 1. Fetch organization memberships
  const { data: membership } = await supabase
    .from("organization_members")
    .select("organization_id, role, organizations(id, display_name, legal_name, status, contact_email, website)")
    .eq("user_id", user.id);

  const firstOrg = membership?.[0]?.organizations;
  const primaryOrganization = (Array.isArray(firstOrg) ? firstOrg[0] : firstOrg) as
    | {
        id: string;
        display_name: string;
        legal_name: string;
        status: string;
        contact_email: string;
        website: string | null;
      }
    | undefined;

  const mappedMemberships = (membership ?? []).map((m: any) => {
    const org = Array.isArray(m.organizations) ? m.organizations[0] : m.organizations;
    return {
      organization_id: m.organization_id,
      role: m.role,
      organizations: org ? { display_name: org.display_name } : null,
    };
  });

  // 2. Fetch role-specific data
  let donations: any[] = [];
  let supporterStats = {
    totalDonated: 0,
    donationCount: 0,
    approvedCount: 0,
    pendingCount: 0,
    rejectedCount: 0,
  };
  let adminStats = {
    pendingCampaigns: 0,
    pendingUpdates: 0,
    pendingOrganizations: 0,
    pendingDonations: 0,
  };

  const isOrg = profile?.role === "organization";
  const isAdmin = profile?.role === "admin";
  const isSupporter = profile?.role === "supporter" || (!isOrg && !isAdmin);

  if (isAdmin) {
    const [campaignsRes, updatesRes, orgsRes, donationsRes] = await Promise.all([
      supabase.from("campaigns").select("id", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("updates").select("id", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("organizations").select("id", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("campaign_donations").select("id", { count: "exact", head: true }).eq("status", "pending"),
    ]);

    adminStats = {
      pendingCampaigns: campaignsRes.count ?? 0,
      pendingUpdates: updatesRes.count ?? 0,
      pendingOrganizations: orgsRes.count ?? 0,
      pendingDonations: donationsRes.count ?? 0,
    };
  }

  if (isSupporter) {
    // Look up by email in donor_registry
    const { data: donor } = await supabase
      .from("donor_registry")
      .select("donor_id")
      .eq("donor_email", user.email)
      .maybeSingle();

    if (donor) {
      const { data: fetchedDonations } = await supabase
        .from("campaign_donations")
        .select("id, amount, status, created_at, is_anonymous, receipt_path, campaigns(title)")
        .eq("donor_id", donor.donor_id)
        .order("created_at", { ascending: false });

      if (fetchedDonations) {
        let totalDonated = 0;
        let approvedCount = 0;
        let pendingCount = 0;
        let rejectedCount = 0;

        for (const d of fetchedDonations) {
          const amt = Number(d.amount ?? 0);
          if (d.status === "approved") {
            totalDonated += amt;
            approvedCount++;
          } else if (d.status === "pending") {
            pendingCount++;
          } else if (d.status === "rejected") {
            rejectedCount++;
          }
        }

        supporterStats = {
          totalDonated,
          donationCount: fetchedDonations.length,
          approvedCount,
          pendingCount,
          rejectedCount,
        };

        // Generate secure signed URLs for donor's own receipts
        donations = await Promise.all(
          fetchedDonations.map(async (d) => {
            let receiptUrl: string | null = null;
            if (d.receipt_path) {
              const { data: signed } = await supabase.storage
                .from("donation-receipts")
                .createSignedUrl(d.receipt_path, 3600);
              receiptUrl = signed?.signedUrl ?? null;
            }
            return {
              ...d,
              receipt_url: receiptUrl,
              amount: Number(d.amount ?? 0),
              status: d.status,
              created_at: d.created_at,
              is_anonymous: d.is_anonymous,
              campaigns: d.campaigns,
            };
          })
        );
      }
    }
  }

  return (
    <ProfileClient
      user={{ email: user.email ?? "" }}
      profile={profile}
      donations={donations}
      supporterStats={isSupporter ? supporterStats : undefined}
      adminStats={isAdmin ? adminStats : undefined}
      organization={primaryOrganization}
      memberships={mappedMemberships}
    />
  );
}
