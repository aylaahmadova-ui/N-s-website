/* eslint-disable @typescript-eslint/no-explicit-any */
import { unstable_cache } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminUnlocked } from "@/lib/admin-access";
import { CampaignsClient } from "./campaigns-client";

const getCampaigns = unstable_cache(
  async () => {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("campaigns")
      .select("id, title, summary, image_url, card_number, contact_number, amount_needed, amount_raised")
      .eq("status", "published")
      .or("campaign_type.eq.general,campaign_type.is.null")
      .order("created_at", { ascending: false });
    return data;
  },
  ["campaigns-published"],
  { revalidate: 60 }
);

export default async function CampaignsPage() {
  const [campaigns, adminUnlocked] = await Promise.all([
    getCampaigns(),
    isAdminUnlocked(),
  ]);

  return (
    <CampaignsClient campaigns={campaigns} adminUnlocked={adminUnlocked} />
  );
}

