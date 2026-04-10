import { NextResponse } from "next/server";
import { childProfileSchema } from "@/lib/validation";
import { getApiContext, hasRole } from "@/lib/api";

export async function POST(request: Request) {
  const context = await getApiContext();
  if (!context.user || !hasRole(context.role, ["organization"]) || !context.organization) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const payload = await request.json();
  const parsed = childProfileSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid child profile data." }, { status: 400 });
  }

  const { error } = await context.supabase.from("child_profiles").insert({
    organization_id: context.organization.id,
    ...parsed.data,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
