import { NextResponse } from "next/server";
import { contentSchema } from "@/lib/validation";
import { getApiContext, hasRole } from "@/lib/api";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const context = await getApiContext();
  if (!context.user || !hasRole(context.role, ["organization", "admin"]) || !context.organization) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await params;

  const { data: existingProduct, error: existingError } = await context.supabase
    .from("products")
    .select("id, organization_id")
    .eq("id", id)
    .maybeSingle();

  if (existingError || !existingProduct) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }

  if (existingProduct.organization_id !== context.organization.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const payload = await request.json();
  const parsed = contentSchema.safeParse(payload);
  if (!parsed.success || parsed.data.price === undefined) {
    return NextResponse.json({ error: "Invalid product data." }, { status: 400 });
  }

  const { title, summary, price, image_url } = parsed.data;
  const { error } = await context.supabase
    .from("products")
    .update({
      title,
      summary,
      price,
      image_url: image_url || null,
      status: "pending",
    })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(_: Request, { params }: Params) {
  const context = await getApiContext();
  if (!context.user || !hasRole(context.role, ["organization", "admin"]) || !context.organization) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await params;

  const { data: existingProduct, error: existingError } = await context.supabase
    .from("products")
    .select("id, organization_id")
    .eq("id", id)
    .maybeSingle();

  if (existingError || !existingProduct) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }

  if (existingProduct.organization_id !== context.organization.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { error } = await context.supabase.from("products").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}

