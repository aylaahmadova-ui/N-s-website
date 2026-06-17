/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminUnlocked } from "@/lib/admin-access";
import { CampaignsClient } from "./campaigns-client";

export default async function CampaignsPage() {
  const supabase = createAdminClient();
  const adminUnlocked = await isAdminUnlocked();
  const { data: campaigns } = await supabase
    .from("campaigns")
    .select("id, title, summary, image_url, card_number, contact_number, amount_needed, amount_raised")
    .eq("status", "published")
    .or("campaign_type.eq.general,campaign_type.is.null")
    .order("created_at", { ascending: false });

  return (
    <CampaignsClient campaigns={campaigns} adminUnlocked={adminUnlocked} />
  );
}
