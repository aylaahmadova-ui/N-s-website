import { NextResponse } from "next/server";
import { contentSchema } from "@/lib/validation";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminApiAccess } from "@/lib/admin-access";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const authError = await requireAdminApiAccess();
  if (authError) return authError;
  const supabase = createAdminClient();

  const { id } = await params;

  const { data: existingProduct, error: existingError } = await supabase
    .from("products")
    .select("id")
    .eq("id", id)
    .maybeSingle();

  if (existingError || !existingProduct) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }

  const payload = await request.json();
  const parsed = contentSchema.safeParse(payload);
  if (!parsed.success || parsed.data.price === undefined) {
    return NextResponse.json({ error: "Invalid product data." }, { status: 400 });
  }

  const { title, summary, story, price, image_url, contact_number, card_number } = parsed.data;
  const { error } = await supabase
    .from("products")
    .update({
      title,
      summary,
      story: story ?? summary,
      price,
      contact_number: contact_number ?? "",
      card_number: card_number ?? "",
      image_url: image_url || null,
      status: "published",
    })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(_: Request, { params }: Params) {
  const authError = await requireAdminApiAccess();
  if (authError) return authError;
  const supabase = createAdminClient();

  const { id } = await params;

  const { data: existingProduct, error: existingError } = await supabase
    .from("products")
    .select("id")
    .eq("id", id)
    .maybeSingle();

  if (existingError || !existingProduct) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }

  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
