/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminUnlocked } from "@/lib/admin-access";
import { ClothesClient } from "./clothes-client";

export default async function ClothesDonationPage() {
  const supabase = createAdminClient();
  const adminUnlocked = await isAdminUnlocked();

  const { data: campaigns } = await supabase
    .from("campaigns")
    .select("id, title, summary, image_url, contact_number, is_done, amount_needed, amount_raised")
    .eq("status", "published")
    .eq("campaign_type", "clothes")
    .order("created_at", { ascending: false });

  return (
    <ClothesClient campaigns={campaigns} adminUnlocked={adminUnlocked} />
  );
}
