import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getOrganizationContext } from "@/lib/dashboard";
import { DashboardOverviewClient } from "./dashboard-overview-client";

export default async function DashboardPage() {
  const { user, profile } = await requireRole(["organization", "admin"]);
  const supabase = await createClient();
  const isAdmin = profile?.role === "admin";

  const organization = await getOrganizationContext(user.id);
  const orgId = organization?.id ?? "00000000-0000-0000-0000-000000000000";

  const [{ count: campaignCount }, { count: updateCount }] = await Promise.all([
    supabase.from("campaigns").select("*", { count: "exact", head: true }).eq("organization_id", orgId),
    supabase.from("updates").select("*", { count: "exact", head: true }).eq("organization_id", orgId),
  ]);

  return (
    <DashboardOverviewClient
      organization={organization}
      campaignCount={campaignCount ?? 0}
      updateCount={updateCount ?? 0}
      isAdmin={isAdmin}
    />
  );
}
