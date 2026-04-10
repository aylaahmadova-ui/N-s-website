import { createClient } from "@/lib/supabase/server";

export async function getOrganizationContext(userId: string) {
  const supabase = await createClient();

  const { data: membership } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (!membership) return null;

  const { data: organization } = await supabase
    .from("organizations")
    .select("*")
    .eq("id", membership.organization_id)
    .maybeSingle();

  return organization;
}
