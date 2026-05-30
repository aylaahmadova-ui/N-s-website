import { NextResponse } from "next/server";
import { contentSchema } from "@/lib/validation";
import { requireAdminApiAccess } from "@/lib/admin-access";
import { createAdminClient } from "@/lib/supabase/admin";
import { resolveMarketplaceOrganizationId } from "@/lib/marketplace-org";

export async function POST(request: Request) {
  const authError = await requireAdminApiAccess();
  if (authError) return authError;
  const supabase = createAdminClient();
  const organizationId = await resolveMarketplaceOrganizationId();

  const payload = await request.json();
  const parsed = contentSchema.safeParse(payload);
  if (!parsed.success || parsed.data.amount_needed === undefined) {
    return NextResponse.json({ error: "Invalid campaign data." }, { status: 400 });
  }
  const campaignType = payload?.campaign_type === "clothes" ? "clothes" : "general";

  const { title, summary, amount_needed, image_url, contact_number } = parsed.data;
  const { error } = await supabase.from("campaigns").insert({
    organization_id: organizationId,
    campaign_type: campaignType,
    title,
    summary,
    image_url: image_url || null,
    contact_number: contact_number || null,
    amount_needed,
    amount_raised: 0,
    status: "published",
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
