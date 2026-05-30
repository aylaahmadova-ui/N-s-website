import { createClient } from "@/lib/supabase/server";

export async function getOrganizationContext(userId: string) {
  const supabase = await createClient();

  const { data: membership } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (!membership) {
    const { data: createdOrganization } = await supabase
      .from("organizations")
      .select("*")
      .eq("created_by", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    return createdOrganization ?? null;
  }

  const { data: organization } = await supabase
    .from("organizations")
    .select("*")
    .eq("id", membership.organization_id)
    .maybeSingle();

  return organization;
}
