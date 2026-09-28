import { requireRole } from "@/lib/auth";
import { getOrganizationContext } from "@/lib/dashboard";
import { createClient } from "@/lib/supabase/server";
import { isAdminUnlocked } from "@/lib/admin-access";
import { DashboardCampaignsClient } from "./dashboard-campaigns-client";

export default async function CampaignsDashboardPage() {
  const { user } = await requireRole(["organization"]);
  const organization = await getOrganizationContext(user.id);
  const supabase = await createClient();
  const adminUnlocked = await isAdminUnlocked();

  const { data: campaigns } = await supabase
    .from("campaigns")
    .select("id, title, summary, amount_needed, amount_raised, status")
    .eq("organization_id", organization?.id ?? "")
    .order("created_at", { ascending: false });

  return <DashboardCampaignsClient campaigns={campaigns as any} adminUnlocked={adminUnlocked} />;
}
