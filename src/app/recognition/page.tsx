import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";

type DonationRecord = {
  donor_id: string | null;
  donor_name: string | null;
  donor_registry?: { donor_surname: string | null } | { donor_surname: string | null }[] | null;
  is_anonymous: boolean | null;
  amount: number | string | null;
};

type RankedDonor = {
  key: string;
  donorName: string;
  totalAmount: number;
};

function formatAmount(amount: number) {
  return `AZN ${amount.toFixed(2)}`;
}

export default async function RecognitionPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("campaign_donations")
    .select("donor_id, donor_name, is_anonymous, amount, donor_registry(donor_surname)")
    .eq("status", "approved");

  const rankedMap = new Map<string, RankedDonor>();

  for (const donation of (data as DonationRecord[] | null) ?? []) {
    if (donation.is_anonymous) continue;

    const amount = Number(donation.amount ?? 0);
    if (!Number.isFinite(amount) || amount <= 0) continue;

    const registry = Array.isArray(donation.donor_registry) ? donation.donor_registry[0] : donation.donor_registry;
    const cleanName = donation.donor_name?.trim();
    const cleanSurname = registry?.donor_surname?.trim() ?? "";
    const fullName = [cleanName, cleanSurname].filter(Boolean).join(" ").trim();
    const key = donation.donor_id || cleanName || "";
    if (!key) continue;

    const existing = rankedMap.get(key);
    if (existing) {
      existing.totalAmount += amount;
      continue;
    }

    rankedMap.set(key, {
      key,
      donorName: fullName || cleanName || "Unnamed donor",
      totalAmount: amount,
    });
  }

  const rankedDonors = Array.from(rankedMap.values()).sort((a, b) => {
    if (b.totalAmount !== a.totalAmount) {
      return b.totalAmount - a.totalAmount;
    }
    return a.donorName.localeCompare(b.donorName);
  });

  return (
    <div className="min-h-screen bg-[#f6f1ea] px-4 py-10 text-[#3f2c1d] md:px-8">
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <section className="rounded-2xl border border-[#e3d5c7] bg-[#fcf7f1] p-6 md:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#9c5f30]">Recognition</p>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-[#5c3418] md:text-5xl">Top Donors</h1>
          <p className="mt-3 max-w-3xl text-sm text-[#6f5442] md:text-base">
            Supporters are ranked by their total non-anonymous donations.
          </p>
        </section>

        <Card title="Ranked supporters">
          {rankedDonors.length ? (
            <div className="space-y-3">
              {rankedDonors.map((donor, index) => (
                <article
                  key={donor.key}
                  className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:grid-cols-[auto_1fr_auto] sm:items-center"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-100 text-sm font-semibold text-amber-900">
                    #{index + 1}
                  </div>
                  <h2 className="text-lg font-semibold text-slate-900">{donor.donorName}</h2>
                  <p className="text-base font-semibold text-amber-900">{formatAmount(donor.totalAmount)}</p>
                </article>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-600">No recognition entries yet.</p>
          )}
        </Card>
      </div>
    </div>
  );
}
