import { createAdminClient } from "@/lib/supabase/admin";

export async function resolveMarketplaceOrganizationId() {
  const admin = createAdminClient();
  const { data: existing } = await admin
    .from("organizations")
    .select("id")
    .eq("display_name", "Destekly Marketplace")
    .limit(1)
    .maybeSingle();

  if (existing?.id) return existing.id;

  const { data: created, error } = await admin
    .from("organizations")
    .insert({
      legal_name: "Destekly Marketplace",
      display_name: "Destekly Marketplace",
      description: "Internal publisher profile.",
      website: null,
      contact_email: "admin@destekly.local",
      status: "approved",
      created_by: null,
    })
    .select("id")
    .single();

  if (error || !created) throw new Error(error?.message ?? "Could not create marketplace organization.");
  return created.id;
}
