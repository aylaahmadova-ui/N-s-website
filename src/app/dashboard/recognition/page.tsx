import { requireRole } from "@/lib/auth";
import { getOrganizationContext } from "@/lib/dashboard";
import { createClient } from "@/lib/supabase/server";
import { DashboardNav } from "@/components/layout/dashboard-nav";
import { Card } from "@/components/ui/card";

type CampaignRecord = {
  id: string;
};

type DonationRecord = {
  donor_id: string;
  donor_name: string;
  is_anonymous: boolean;
  amount: number | string | null;
};

type RankedDonor = {
  donorId: string;
  donorName: string;
  donationCount: number;
  totalAmount: number;
};

function formatAmount(amount: number) {
  return `AZN ${amount.toFixed(2)}`;
}

function formatDonationCount(count: number) {
  return `${count} donation${count === 1 ? "" : "s"}`;
}

export default async function RecognitionDashboardPage() {
  const { user } = await requireRole(["organization"]);
  const organization = await getOrganizationContext(user.id);
  const supabase = await createClient();

  const { data: campaigns } = await supabase
    .from("campaigns")
    .select("id")
    .eq("organization_id", organization?.id ?? "");

  const campaignIds = (campaigns as CampaignRecord[] | null)?.map((campaign) => campaign.id) ?? [];

  const rankedDonors = new Map<string, RankedDonor>();
  let anonymousTotal = 0;
  let anonymousDonationCount = 0;

  if (campaignIds.length) {
    const { data: donations } = await supabase
      .from("campaign_donations")
      .select("donor_id, donor_name, is_anonymous, amount")
      .in("campaign_id", campaignIds);

    for (const donation of (donations as DonationRecord[] | null) ?? []) {
      const amount = Number(donation.amount ?? 0);

      if (donation.is_anonymous) {
        anonymousTotal += amount;
        anonymousDonationCount += 1;
        continue;
      }

      const existing = rankedDonors.get(donation.donor_id);

      if (existing) {
        existing.totalAmount += amount;
        existing.donationCount += 1;
        continue;
      }

      rankedDonors.set(donation.donor_id, {
        donorId: donation.donor_id,
        donorName: donation.donor_name,
        donationCount: 1,
        totalAmount: amount,
      });
    }
  }

  const donorRows = Array.from(rankedDonors.values()).sort((left, right) => {
    if (right.totalAmount !== left.totalAmount) {
      return right.totalAmount - left.totalAmount;
    }

    if (right.donationCount !== left.donationCount) {
      return right.donationCount - left.donationCount;
    }

    return left.donorName.localeCompare(right.donorName);
  });

  const visibleTotal = donorRows.reduce((sum, donor) => sum + donor.totalAmount, 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-8">
      <div className="grid gap-6 md:grid-cols-[240px_1fr]">
        <DashboardNav />
        <div className="space-y-5">
          <Card title="Donor recognition" description="Named donors are ranked by their total visible donations across your donation calls.">
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm text-slate-600">Recognized donors</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">{donorRows.length}</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm text-slate-600">Visible donated amount</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">{formatAmount(visibleTotal)}</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm text-slate-600">Anonymous donations</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">{formatAmount(anonymousTotal)}</p>
                <p className="mt-1 text-xs text-slate-500">{formatDonationCount(anonymousDonationCount)} kept private</p>
              </div>
            </div>
          </Card>

          <Card title="Ranked supporters">
            {donorRows.length ? (
              <div className="space-y-3">
                {donorRows.map((donor, index) => (
                  <article key={donor.donorId} className="grid gap-3 rounded-lg border border-slate-200 p-4 sm:grid-cols-[auto_1fr_auto] sm:items-center">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-100 text-sm font-semibold text-amber-900">
                      #{index + 1}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{donor.donorName}</h3>
                      <p className="mt-1 text-sm text-slate-600">{formatDonationCount(donor.donationCount)}</p>
                    </div>
                    <p className="text-base font-semibold text-amber-900">{formatAmount(donor.totalAmount)}</p>
                  </article>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-600">
                {anonymousDonationCount
                  ? "Support has already come in, but every donation is marked anonymous, so there are no names to display yet."
                  : "No donor recognition entries yet."}
              </p>
            )}

            <p className="mt-4 text-xs text-slate-500">Anonymous gifts are kept out of the ranking to respect donor privacy.</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
