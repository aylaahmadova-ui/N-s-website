import { NextResponse } from "next/server";
import { updateSchema } from "@/lib/validation";
import { getApiContext } from "@/lib/api";
import { requireAdminApiAccess } from "@/lib/admin-access";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const adminAuthError = await requireAdminApiAccess();
  const context = await getApiContext();
  const isAdminUnlocked = !adminAuthError;
  const canUseUserContext = !!context.user;

  if (!isAdminUnlocked && !canUseUserContext) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let organizationId = context.organization?.id ?? null;

  if (!organizationId && (context.role === "admin" || isAdminUnlocked)) {
    const orgClient = isAdminUnlocked ? createAdminClient() : context.supabase;
    const { data: fallbackOrg } = await orgClient
      .from("organizations")
      .select("id")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    organizationId = fallbackOrg?.id ?? null;
  }

  if (!organizationId) {
    return NextResponse.json({ error: "No organization found for this account." }, { status: 400 });
  }

  const payload = await request.json();
  const parsed = updateSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid update data." }, { status: 400 });
  }

  const { title, details } = parsed.data;
  const writeClient = isAdminUnlocked ? createAdminClient() : context.supabase;
  const { error } = await writeClient.from("updates").insert({
    organization_id: organizationId,
    title,
    details,
    status: context.role === "admin" || isAdminUnlocked ? "published" : "pending",
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
