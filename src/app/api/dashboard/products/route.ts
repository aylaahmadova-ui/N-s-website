import { NextResponse } from "next/server";
import { contentSchema } from "@/lib/validation";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminApiAccess } from "@/lib/admin-access";
import { resolveMarketplaceOrganizationId } from "@/lib/marketplace-org";

export async function POST(request: Request) {
  const authError = await requireAdminApiAccess();
  if (authError) return authError;
  const supabase = createAdminClient();

  const payload = await request.json();
  const parsed = contentSchema.safeParse(payload);
  if (!parsed.success || parsed.data.price === undefined) {
    return NextResponse.json({ error: "Invalid product data." }, { status: 400 });
  }

  const organizationId = await resolveMarketplaceOrganizationId();
  const { title, summary, story, price, image_url, contact_number, card_number } = parsed.data;
  const { error } = await supabase.from("products").insert({
    organization_id: organizationId,
    title,
    summary,
    story: story ?? summary,
    price,
    contact_number: contact_number ?? "",
    card_number: card_number ?? "",
    image_url: image_url || null,
    status: "published",
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
