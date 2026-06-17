/* eslint-disable @typescript-eslint/no-explicit-any */
import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import ProfileClient from "./profile-client";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const { user, profile } = await requireAuth();
  const supabase = await createClient();

  const isOrg = profile?.role === "organization";
  const isAdmin = profile?.role === "admin";
  const isSupporter = profile?.role === "supporter" || (!isOrg && !isAdmin);

  // Run membership query in parallel with role-specific data
  const [membershipResult, roleData] = await Promise.all([
    // 1. Organization memberships
    supabase
      .from("organization_members")
      .select("organization_id, role, organizations(id, display_name, legal_name, status, contact_email, website)")
      .eq("user_id", user.id),

    // 2. Role-specific data (admin stats OR donor lookup)
    isAdmin
      ? fetchAdminStats(supabase)
      : isSupporter
        ? fetchSupporterData(supabase, user.email ?? "")
        : Promise.resolve(null),
  ]);

  const membership = membershipResult.data;
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

  const adminStats = isAdmin ? (roleData as any) : undefined;
  const supporterResult = isSupporter ? (roleData as any) : null;

  return (
    <ProfileClient
      user={{ email: user.email ?? "" }}
      profile={profile}
      donations={supporterResult?.donations ?? []}
      supporterStats={isSupporter ? (supporterResult?.stats ?? { totalDonated: 0, donationCount: 0, approvedCount: 0, pendingCount: 0, rejectedCount: 0 }) : undefined}
      adminStats={adminStats}
      organization={primaryOrganization}
      memberships={mappedMemberships}
    />
  );
}

async function fetchAdminStats(supabase: any) {
  const [campaignsRes, updatesRes, orgsRes, donationsRes] = await Promise.all([
    supabase.from("campaigns").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("updates").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("organizations").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("campaign_donations").select("id", { count: "exact", head: true }).eq("status", "pending"),
  ]);

  return {
    pendingCampaigns: campaignsRes.count ?? 0,
    pendingUpdates: updatesRes.count ?? 0,
    pendingOrganizations: orgsRes.count ?? 0,
    pendingDonations: donationsRes.count ?? 0,
  };
}

async function fetchSupporterData(supabase: any, email: string) {
  const { data: donor } = await supabase
    .from("donor_registry")
    .select("donor_id")
    .eq("donor_email", email)
    .maybeSingle();

  if (!donor) {
    return { donations: [], stats: { totalDonated: 0, donationCount: 0, approvedCount: 0, pendingCount: 0, rejectedCount: 0 } };
  }

  const { data: fetchedDonations } = await supabase
    .from("campaign_donations")
    .select("id, amount, status, created_at, is_anonymous, receipt_path, campaigns(title)")
    .eq("donor_id", donor.donor_id)
    .order("created_at", { ascending: false });

  if (!fetchedDonations) {
    return { donations: [], stats: { totalDonated: 0, donationCount: 0, approvedCount: 0, pendingCount: 0, rejectedCount: 0 } };
  }

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

  // Generate secure signed URLs for donor's own receipts in parallel
  const donations = await Promise.all(
    fetchedDonations.map(async (d: any) => {
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

  return {
    donations,
    stats: { totalDonated, donationCount: fetchedDonations.length, approvedCount, pendingCount, rejectedCount },
  };
}
