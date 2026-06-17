/* eslint-disable @typescript-eslint/no-explicit-any */
import { unstable_cache } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminUnlocked } from "@/lib/admin-access";
import { ClothesClient } from "./clothes-client";

const getClothesCampaigns = unstable_cache(
  async () => {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("campaigns")
      .select("id, title, summary, image_url, contact_number, is_done, amount_needed, amount_raised")
      .eq("status", "published")
      .eq("campaign_type", "clothes")
      .order("created_at", { ascending: false });
    return data;
  },
  ["campaigns-clothes-published"],
  { revalidate: 60 }
);

export default async function ClothesDonationPage() {
  const [campaigns, adminUnlocked] = await Promise.all([
    getClothesCampaigns(),
    isAdminUnlocked(),
  ]);

  return (
    <ClothesClient campaigns={campaigns} adminUnlocked={adminUnlocked} />
  );
}

