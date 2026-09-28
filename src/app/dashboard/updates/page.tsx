import { requireRole } from "@/lib/auth";
import { getOrganizationContext } from "@/lib/dashboard";
import { createClient } from "@/lib/supabase/server";
import { isAdminUnlocked } from "@/lib/admin-access";
import { DashboardUpdatesClient } from "./dashboard-updates-client";

export default async function UpdatesDashboardPage() {
  const { user } = await requireRole(["organization"]);
  const organization = await getOrganizationContext(user.id);
  const supabase = await createClient();
  const adminUnlocked = await isAdminUnlocked();

  const { data: updates } = await supabase
    .from("updates")
    .select("id, title, details, status, created_at")
    .eq("organization_id", organization?.id ?? "")
    .order("created_at", { ascending: false });

  return <DashboardUpdatesClient updates={updates as any} adminUnlocked={adminUnlocked} />;
}
