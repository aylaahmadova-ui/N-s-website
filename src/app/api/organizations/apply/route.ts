import { NextResponse } from "next/server";
import { getApiContext, hasRole } from "@/lib/api";
import { organizationApplicationSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const context = await getApiContext();
  if (!context.user || !hasRole(context.role, ["organization"])) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const payload = await request.json();
  const parsed = organizationApplicationSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid application form." }, { status: 400 });
  }

  const { legalName, displayName, description, website, contactEmail } = parsed.data;
  if (context.organization) {
    const { error } = await context.supabase
      .from("organizations")
      .update({
        legal_name: legalName,
        display_name: displayName,
        description,
        website: website || null,
        contact_email: contactEmail,
        status: "pending",
      })
      .eq("id", context.organization.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  }

  const { data: organization, error } = await context.supabase
    .from("organizations")
    .insert({
      legal_name: legalName,
      display_name: displayName,
      description,
      website: website || null,
      contact_email: contactEmail,
      status: "pending",
      created_by: context.user.id,
    })
    .select("id")
    .single();

  if (error || !organization) {
    return NextResponse.json({ error: error?.message ?? "Could not create application." }, { status: 400 });
  }

  await context.supabase.from("organization_members").insert({
    organization_id: organization.id,
    user_id: context.user.id,
    role: "owner",
  });

  return NextResponse.json({ ok: true });
}
