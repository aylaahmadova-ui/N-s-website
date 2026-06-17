import { createClient } from "@/lib/supabase/server";
import { RecognitionClient } from "./recognition-client";

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
    <RecognitionClient rankedDonors={rankedDonors} />
  );
}
