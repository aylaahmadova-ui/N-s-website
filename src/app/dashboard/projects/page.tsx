import { requireRole } from "@/lib/auth";
import { getOrganizationContext } from "@/lib/dashboard";
import { createClient } from "@/lib/supabase/server";
import { DashboardProjectsClient } from "./dashboard-projects-client";

export default async function ProjectsDashboardPage() {
  const { user } = await requireRole(["organization"]);
  const organization = await getOrganizationContext(user.id);
  const supabase = await createClient();

  const { data: projects } = await supabase
    .from("projects")
    .select("id, title, summary, amount_needed, amount_raised, status")
    .eq("organization_id", organization?.id ?? "")
    .order("created_at", { ascending: false });

  return <DashboardProjectsClient projects={projects as any} />;
}
