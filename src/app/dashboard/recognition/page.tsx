import { requireRole } from "@/lib/auth";
import { getOrganizationContext } from "@/lib/dashboard";
import { createClient } from "@/lib/supabase/server";
import { DashboardRecognitionClient } from "./dashboard-recognition-client";

type CampaignRecord = { id: string };
type DonationRecord = {
  donor_id: string;
  donor_name: string;
  donor_registry?: { donor_surname: string | null } | { donor_surname: string | null }[] | null;
  is_anonymous: boolean;
  amount: number | string | null;
};

export default async function RecognitionDashboardPage() {
  const { user } = await requireRole(["organization"]);
  const organization = await getOrganizationContext(user.id);
  const supabase = await createClient();

  const { data: campaigns } = await supabase
    .from("campaigns")
    .select("id")
    .eq("organization_id", organization?.id ?? "");

  const campaignIds = (campaigns as CampaignRecord[] | null)?.map((c) => c.id) ?? [];

  const donorMap = new Map<string, { donorId: string; donorName: string; donationCount: number; totalAmount: number }>();
  let anonymousTotal = 0;
  let anonymousDonationCount = 0;

  if (campaignIds.length) {
    const { data: donations } = await supabase
      .from("campaign_donations")
      .select("donor_id, donor_name, is_anonymous, amount, donor_registry(donor_surname)")
      .in("campaign_id", campaignIds);

    for (const donation of (donations as DonationRecord[] | null) ?? []) {
      const amount = Number(donation.amount ?? 0);
      if (donation.is_anonymous) {
        anonymousTotal += amount;
        anonymousDonationCount += 1;
        continue;
      }
      const registry = Array.isArray(donation.donor_registry) ? donation.donor_registry[0] : donation.donor_registry;
      const surname = registry?.donor_surname?.trim() ?? "";
      const fullName = [donation.donor_name?.trim(), surname].filter(Boolean).join(" ") || donation.donor_name;
      const existing = donorMap.get(donation.donor_id);
      if (existing) {
        existing.totalAmount += amount;
        existing.donationCount += 1;
      } else {
        donorMap.set(donation.donor_id, { donorId: donation.donor_id, donorName: fullName, donationCount: 1, totalAmount: amount });
      }
    }
  }

  const donorRows = Array.from(donorMap.values()).sort((a, b) => {
    if (b.totalAmount !== a.totalAmount) return b.totalAmount - a.totalAmount;
    if (b.donationCount !== a.donationCount) return b.donationCount - a.donationCount;
    return a.donorName.localeCompare(b.donorName);
  });

  const visibleTotal = donorRows.reduce((sum, d) => sum + d.totalAmount, 0);

  return (
    <DashboardRecognitionClient
      donorRows={donorRows}
      visibleTotal={visibleTotal}
      anonymousTotal={anonymousTotal}
      anonymousDonationCount={anonymousDonationCount}
    />
  );
}
