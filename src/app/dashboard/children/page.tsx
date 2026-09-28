import { requireRole } from "@/lib/auth";
import { getOrganizationContext } from "@/lib/dashboard";
import { createClient } from "@/lib/supabase/server";
import { DashboardChildrenClient } from "./dashboard-children-client";

export default async function ChildrenDashboardPage() {
  const { user } = await requireRole(["organization"]);
  const organization = await getOrganizationContext(user.id);
  const supabase = await createClient();

  const { data: childProfiles } = await supabase
    .from("child_profiles")
    .select("id, alias_name, age_range, talents, story_summary")
    .eq("organization_id", organization?.id ?? "")
    .order("created_at", { ascending: false });

  return <DashboardChildrenClient childProfiles={childProfiles as any} />;
}
