import { NextResponse } from "next/server";
import { updateSchema } from "@/lib/validation";
import { getApiContext, hasRole } from "@/lib/api";

export async function POST(request: Request) {
  const context = await getApiContext();
  if (!context.user || !hasRole(context.role, ["organization"]) || !context.organization) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const payload = await request.json();
  const parsed = updateSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid update data." }, { status: 400 });
  }

  const { title, details } = parsed.data;
  const { error } = await context.supabase.from("updates").insert({
    organization_id: context.organization.id,
    title,
    details,
    status: "pending",
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
