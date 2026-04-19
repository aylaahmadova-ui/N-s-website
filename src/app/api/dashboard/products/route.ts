import { NextResponse } from "next/server";
import { contentSchema } from "@/lib/validation";
import { getApiContext, hasRole } from "@/lib/api";

export async function POST(request: Request) {
  const context = await getApiContext();
  if (!context.user || !hasRole(context.role, ["organization", "admin"]) || !context.organization) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const payload = await request.json();
  const parsed = contentSchema.safeParse(payload);
  if (!parsed.success || parsed.data.price === undefined) {
    return NextResponse.json({ error: "Invalid product data." }, { status: 400 });
  }

  const { title, summary, price, image_url } = parsed.data;
  const { error } = await context.supabase.from("products").insert({
    organization_id: context.organization.id,
    title,
    summary,
    price,
    image_url: image_url || null,
    status: "pending",
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
