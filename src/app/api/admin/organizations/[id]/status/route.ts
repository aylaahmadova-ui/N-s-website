import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminApiAccess } from "@/lib/admin-access";

const schema = z.object({
  status: z.enum(["approved", "rejected"]),
});

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAdminApiAccess();
  if (authError) return authError;
  const supabase = createAdminClient();

  const payload = await request.json();
  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid status payload." }, { status: 400 });
  }

  const { id } = await params;

  const { error } = await supabase.from("organizations").update({ status: parsed.data.status }).eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  await supabase.from("moderation_logs").insert({
    actor_id: null,
    target_type: "organization",
    target_id: id,
    action: parsed.data.status,
    notes: "Organization review decision",
  });

  return NextResponse.json({ ok: true });
}
