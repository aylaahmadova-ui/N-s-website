import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminApiAccess } from "@/lib/admin-access";

const schema = z.object({
  table: z.enum(["campaigns", "projects", "updates"]),
  id: z.string().uuid(),
  status: z.enum(["approved", "rejected", "published"]),
  notes: z.string().optional(),
});

export async function POST(request: Request) {
  const authError = await requireAdminApiAccess();
  if (authError) return authError;
  const supabase = createAdminClient();

  const payload = await request.json();
  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid moderation payload." }, { status: 400 });
  }

  const { table, id, status, notes } = parsed.data;

  const { error } = await supabase.from(table).update({ status }).eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  await supabase.from("moderation_logs").insert({
    actor_id: null,
    target_type: table.slice(0, -1),
    target_id: id,
    action: status,
    notes: notes ?? "Admin moderation action",
  });

  return NextResponse.json({ ok: true });
}
