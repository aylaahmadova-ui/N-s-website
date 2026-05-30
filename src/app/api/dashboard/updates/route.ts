import { NextResponse } from "next/server";
import { updateSchema } from "@/lib/validation";
import { requireAdminApiAccess } from "@/lib/admin-access";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const adminAuthError = await requireAdminApiAccess();
  if (adminAuthError) return adminAuthError;

  const supabase = createAdminClient();
  const { data: fallbackOrg } = await supabase.from("organizations").select("id").order("created_at", { ascending: true }).limit(1).maybeSingle();
  const organizationId = fallbackOrg?.id ?? null;

  if (!organizationId) {
    return NextResponse.json({ error: "No organization found." }, { status: 400 });
  }

  const payload = await request.json();
  const parsed = updateSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid update data." }, { status: 400 });
  }

  const { title, details } = parsed.data;
  const { error } = await supabase.from("updates").insert({
    organization_id: organizationId,
    title,
    details,
    status: "published",
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
