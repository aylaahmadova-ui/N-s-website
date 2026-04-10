import { NextResponse } from "next/server";
import { z } from "zod";
import { getApiContext, hasRole } from "@/lib/api";

const schema = z.object({
  table: z.enum(["products", "campaigns", "projects", "updates"]),
  id: z.string().uuid(),
  status: z.enum(["approved", "rejected", "published"]),
  notes: z.string().optional(),
});

export async function POST(request: Request) {
  const context = await getApiContext();
  if (!context.user || !hasRole(context.role, ["admin"])) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const payload = await request.json();
  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid moderation payload." }, { status: 400 });
  }

  const { table, id, status, notes } = parsed.data;

  const { error } = await context.supabase.from(table).update({ status }).eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  await context.supabase.from("moderation_logs").insert({
    actor_id: context.user.id,
    target_type: table.slice(0, -1),
    target_id: id,
    action: status,
    notes: notes ?? "Content moderation action",
  });

  return NextResponse.json({ ok: true });
}
